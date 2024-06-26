import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { Button } from "@/components/ui/Button";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  SaveIcon,
} from "lucide-react-native";
import tw from "@/lib/tailwind";
import { useRouter } from "expo-router";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import ListEmptyText from "@/components/ListEmptyText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { fonts } from "@/lib/styles";
import { useCollections } from "@/context/CollectionsProvider";
import { useAlert } from "@/context/AlertProvider";
import { Picker } from "@react-native-picker/picker";
import { constants } from "@/constants/constants";
import Checkbox from "expo-checkbox";
import Avatar from "@/components/Avatar";
import { useTranslation } from "react-i18next";

export default function Collections() {
  const { session } = useSupabase();
  const router = useRouter();
  const [friendCollections, setFriendCollections] = useState<
    (Tables<"post_collections"> & {
      user: {
        id: string;
      };
    })[]
  >([]);
  const [currentCollection, setCurrentCollection] =
    useState<Tables<"post_collections"> | null>(null);
  const [emoji, setEmoji] = useState("😊");
  const [label, setLabel] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const modalRef = useRef<BottomSheetModal>(null);
  const { colorScheme } = useColorScheme();
  const snapPoints = ["90%"];
  const { collections: myCollections, getCollectionById } = useCollections();
  const alertRef = useAlert();
  const { t } = useTranslation();

  async function getFriendCollections() {
    const { data: friendData, error: friendError } = await sb
      .from("post_collections")
      .select("*, user:user_id(id)")
      .neq("user_id", session?.user.id as string)
      .eq("public", true)
      .order("created_at", { ascending: false });

    if (friendError) {
      console.error(friendError);
      return;
    }

    setFriendCollections(friendData);
  }

  useEffect(() => {
    getFriendCollections();
  }, []);

  const handleDelete = async (collectionId: string) => {
    Alert.alert(
      t("collections:delete-collection"),
      t("collections:delete-collection-confirmation"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await sb
              .from("post_collections")
              .delete()
              .eq("id", collectionId);
            if (error) {
              console.error(error);
            } else {
              alertRef.current?.showAlert({
                title: t("collections:collection-deleted"),
              });
              getFriendCollections();
            }
          },
        },
      ]
    );
  };

  const openModal = async (collection: Tables<"post_collections"> | null) => {
    if (collection) {
      const { data } = await sb
        .from("post_collections")
        .select("emoji, label, public, posts(id)")
        .eq("id", collection.id)
        .single();

      if (data) {
        setEmoji(data.emoji as string);
        setLabel(data.label);
        setIsPublic(data.public);
        setPostCount(data.posts.length);
        setCurrentCollection(collection);
      }
    } else {
      setEmoji("😊");
      setLabel("");
      setIsPublic(false);
      setPostCount(0);
      setCurrentCollection(null);
    }
    modalRef.current?.present();
  };

  const saveCollection = async () => {
    if (!label) {
      return;
    }

    if (currentCollection) {
      const { error } = await sb
        .from("post_collections")
        .update({ emoji, label, public: isPublic })
        .eq("id", currentCollection.id);

      if (error) {
        console.error(error);
        Alert.alert("Error", "Failed to update collection.");
        return;
      }
    } else {
      const { error } = await sb.from("post_collections").insert({
        emoji,
        label,
        user_id: session?.user.id,
        public: isPublic,
      });

      if (error) {
        console.error(error);
        Alert.alert("Error", "Failed to create collection.");
        return;
      }
    }

    modalRef.current?.close();
    getFriendCollections();
  };

  const CollectionItem = ({
    collection,
    isMine,
  }: {
    collection: Tables<"post_collections"> & {
      user?: {
        id: string;
      };
    };
    isMine: boolean;
  }) => (
    <View
      style={tw`flex-row items-center justify-between py-3 border-b border-muted dark:border-dark-muted`}
    >
      <View style={tw`flex-1 flex flex-row gap-1.3 items-center`}>
        {collection.user && <Avatar userId={collection.user.id} size={24} />}
        <Text>
          {collection.emoji} {collection.label}
        </Text>
      </View>
      <View style={tw`flex-row gap-2`}>
        <TouchableOpacity
          onPress={() => router.push(`/home/collection/${collection.id}`)}
        >
          <EyeIcon size={24} color={tw.color("accent")} />
        </TouchableOpacity>
        {isMine && (
          <>
            <TouchableOpacity onPress={() => openModal(collection)}>
              <PencilIcon size={24} color={tw.color("primary")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(collection.id)}>
              <TrashIcon size={24} color={tw.color("destructive")} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <Background noPadding>
      <ScrollView style={tw`p-4`}>
        <Button
          label={t("collections:create-new-collection")}
          onPress={() => openModal(null)}
          icon={<PlusIcon size={24} color={tw.color("background")} />}
          style={tw`mb-4`}
        />
        <Text
          style={[
            tw`text-xl mb-2`,
            {
              fontFamily: fonts.inter.bold,
            },
          ]}
        >
          {t("collections:my-collections")}
        </Text>
        {myCollections.length > 0 ? (
          myCollections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={{
                ...collection,
              }}
              isMine={true}
            />
          ))
        ) : (
          <ListEmptyText text="No collections found." />
        )}
        <Text
          style={[
            tw`text-xl mb-2 mt-6`,
            {
              fontFamily: fonts.inter.bold,
            },
          ]}
        >
          {t("collections:friend-collections")}
        </Text>
        {friendCollections.length > 0 ? (
          friendCollections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              isMine={false}
            />
          ))
        ) : (
          <ListEmptyText text={t("collections:no-collections-found")} />
        )}
      </ScrollView>
      <BottomSheetModal
        ref={modalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-new-bg border-t border-bd`}
        handleIndicatorStyle={tw`bg-mt-fg`}
        style={tw`px-6 py-4`}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            enableTouchThrough={false}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={[
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
              tw`absolute top-0 bottom-0 left-0 right-0`,
            ]}
          />
        )}
      >
        <SafeAreaView style={tw`flex-1 justify-between`}>
          <KeyboardAvoidingView behavior="padding" style={tw`flex-1`}>
            <View style={tw`flex-1`}>
              <Picker
                selectedValue={emoji}
                onValueChange={(value) => setEmoji(value as string)}
                style={tw`bg-new-bg border border-bd rounded-lg`}
                mode="dialog"
              >
                {constants.COLLECTION_EMOJIS.map((emoji) => (
                  <Picker.Item key={emoji} label={emoji} value={emoji} />
                ))}
              </Picker>
              <Input
                label={t("common:label")}
                value={label}
                onChangeText={setLabel}
                placeholder={t("collections:collection-placeholder")}
              />
              <View style={tw`flex-row items-center gap-2 my-3`}>
                <Checkbox
                  value={isPublic}
                  onValueChange={setIsPublic}
                  color={tw.color("primary")}
                />
                <Text style={tw`text-lg`}>{t("common:public")}</Text>
              </View>
              {currentCollection && (
                <View
                  style={tw`flex flex-row justify-between gap-2 items-center`}
                >
                  <Text>{t("collections:post-count")}</Text>
                  <Text
                    style={[
                      tw`text-lg`,
                      {
                        fontFamily: fonts.inter.semiBold,
                      },
                    ]}
                  >
                    {postCount}
                  </Text>
                </View>
              )}
            </View>
            <Button
              label="Save Collection"
              onPress={saveCollection}
              icon={<SaveIcon size={24} color={tw.color("background")} />}
              disabled={!label}
              style={tw`mt-4 mb-10`}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BottomSheetModal>
    </Background>
  );
}
