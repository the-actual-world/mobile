import { Alert, Dimensions, Linking, StyleSheet, View } from "react-native";
import { Text } from "./ui/Text";
import Avatar from "./Avatar";
import React from "react";
import { Database } from "@/supabase/functions/_shared/supabase";
import { Image } from "expo-image";
import tw from "@/lib/tailwind";
import {
  ConditionalWrapper,
  LocationUtils,
  getPostAttachmentSource,
  showActionSheet,
} from "@/lib/utils";
import Carousel from "react-native-reanimated-carousel";
import Gallery from "react-native-awesome-gallery";
import {
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import ImageView from "react-native-image-viewing";
import { fonts } from "@/lib/styles";
import {
  EditIcon,
  EllipsisVerticalIcon,
  ScanEyeIcon,
} from "lucide-react-native";
import { useTimeAgo } from "@/context/TimeAgoProvider";
import { useSettings } from "@/context/SettingsProvider";
import Hyperlink from "react-native-hyperlink";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { useAlert } from "@/context/AlertProvider";
import { Link, useRouter } from "expo-router";
import { useActionSheet } from "@expo/react-native-action-sheet";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useCollections } from "@/context/CollectionsProvider";
import Checkbox from "expo-checkbox";
import ListEmptyText from "./ListEmptyText";

export type PostProps = {
  id: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  attachments: {
    caption: string;
    path: string;
    media_type: Database["public"]["Enums"]["mediatype"];
  }[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
  tagged_users: {
    id: string;
    name: string;
  }[];
  updated_at: Date;
  created_at: Date;
};

export default React.memo(Post);

function Post({
  id,
  author,
  text,
  attachments,
  location,
  tagged_users,
  updated_at,
  created_at,
  linkToPost = true,
}: PostProps & { linkToPost?: boolean }) {
  const width = Dimensions.get("window").width;
  const [attachmentIndex, setAttachmentIndex] = React.useState<number | null>(
    null
  );

  const { t, i18n } = useTranslation();
  const { session } = useSupabase();
  const { colorScheme } = useColorScheme();
  const { settings } = useSettings();
  const timeAgo = useTimeAgo();
  const alertRef = useAlert();
  const router = useRouter();
  const isCurrentUser = author.id === session?.user.id;
  const {
    collections,
    getCollectionById,
    isPostInCollection,
    togglePostInCollection,
  } = useCollections();

  const attachmentList: {
    uri: string;
  }[] = attachments.map((attachment) => ({
    uri: getPostAttachmentSource(attachment.path, author.id),
  }));

  const [locationName, setLocationName] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function getLocationName() {
      if (location) {
        setLocationName(
          await LocationUtils.getLocationName(location, i18n.language)
        );
      }
    }
    getLocationName();
  }, [location]);

  const urls = text.match(
    /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g
  );

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["30%"], []);

  const { showActionSheetWithOptions } = useActionSheet();

  const showMyActionSheet = async () => {
    async function handleAddToCollection() {
      bottomSheetModalRef.current?.present();
    }

    if (!isCurrentUser) {
      showActionSheet(
        { showActionSheetWithOptions, colorScheme },
        {
          options: [t("rewind:addToCollection"), t("common:cancel")],
          cancelButtonIndex: 1,
        },
        (index) => {
          if (index === 0) {
            handleAddToCollection();
          }
        }
      );
    } else {
      showActionSheet(
        { showActionSheetWithOptions, colorScheme },
        {
          options: [
            t("rewind:addToCollection"),
            t("common:edit"),
            t("common:delete"),
            t("common:cancel"),
          ],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 3,
        },
        (index) => {
          if (index === 0) {
            handleAddToCollection();
          } else if (index === 1) {
            router.push("/home/post/" + id + "/edit");
          } else if (index === 2) {
            Alert.alert(
              t("common:delete"),
              t("common:deletePostConfirmation"),
              [
                {
                  text: t("common:cancel"),
                  style: "cancel",
                },
                {
                  text: t("common:delete"),
                  style: "destructive",
                  onPress: async () => {
                    await sb.storage
                      .from("post_attachments")
                      .remove(attachments.map((attachment) => attachment.path));
                    await sb
                      .from("post_attachments")
                      .delete()
                      .eq("post_id", id);
                    await sb.from("post_comments").delete().eq("post_id", id);
                    await sb
                      .from("post_tagged_users")
                      .delete()
                      .eq("post_id", id);
                    await sb.from("posts").delete().eq("id", id);

                    alertRef.current?.showAlert({
                      title: t("common:deleted"),
                      message: t("common:postDeleted"),
                    });
                  },
                },
              ]
            );
          }
        }
      );
    }
  };

  return (
    <View style={tw`w-full`}>
      <BottomSheetModal
        ref={bottomSheetModalRef}
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
              { backgroundColor: "rgba(0, 0, 0, 1)" },
              StyleSheet.absoluteFillObject,
            ]}
          />
        )}
      >
        <View style={tw`flex-1 pb-5`}>
          <BottomSheetFlatList
            data={collections}
            renderItem={({ item }) => (
              <View
                style={tw`flex-row items-center justify-between py-3 border-b border-muted`}
              >
                <Text>
                  {item.emoji} {item.label}
                </Text>
                <Checkbox
                  value={isPostInCollection(id, item.id)}
                  onValueChange={() => {
                    togglePostInCollection(id, item.id);
                  }}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={tw`px-3`}
            ListEmptyComponent={
              <ListEmptyText text={t("collections:no-collections-found")} />
            }
          />
        </View>
      </BottomSheetModal>

      <ConditionalWrapper
        condition={linkToPost}
        wrapper={(children) => (
          <TouchableOpacity onPress={() => router.push("/home/post/" + id)}>
            {children}
          </TouchableOpacity>
        )}
      >
        <ImageView
          images={attachmentList || []}
          imageIndex={attachmentIndex || 0}
          visible={attachmentIndex !== null}
          onRequestClose={() => setAttachmentIndex(null)}
          swipeToCloseEnabled={false}
          presentationStyle="overFullScreen"
        />
        <View
          style={tw`px-4 gap-2 bg-background dark:bg-dark-background py-4 rounded-lg`}
        >
          <View style={tw`flex-row items-center`}>
            <Avatar userId={author.id} size={40} />
            <View style={tw`ml-2 gap-1`}>
              <Text
                style={{
                  fontFamily: fonts.inter.medium,
                }}
              >
                {author.name}
              </Text>
              {location && (
                <Text style={tw`text-xs text-mt-fg`}>
                  {locationName || `${location.latitude},${location.longitude}`}
                </Text>
              )}
            </View>
            <View style={tw`ml-auto flex-row gap-2 items-center`}>
              <Text style={tw`text-xs text-mt-fg`}>
                {settings.others.showRelativeTime
                  ? timeAgo.format(created_at)
                  : created_at.toLocaleString()}
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  showMyActionSheet();
                }}
              >
                <EllipsisVerticalIcon
                  size={20}
                  color={
                    colorScheme === "dark"
                      ? tw.color("dark-muted-foreground")
                      : tw.color("muted-foreground")
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
          {text && (
            <Hyperlink
              onPress={(url) => {
                Linking.openURL(url);
              }}
              linkStyle={{
                color: colorScheme
                  ? tw.color("accent")
                  : tw.color("dark-accent"),
              }}
              style={tw`mb-1`}
            >
              <Text>{text}</Text>
            </Hyperlink>
          )}

          {tagged_users.length > 0 && (
            <FlatList
              data={tagged_users}
              renderItem={({ item }) =>
                item.name ? (
                  <View style={tw`flex-row items-center gap-2`}>
                    <Avatar userId={item.id as string} size={25} />
                    <Text>{item.name}</Text>
                  </View>
                ) : (
                  <Text muted style={tw`text-xs`}>
                    {t("common:unknown")}
                  </Text>
                )
              }
              keyExtractor={(item) => (item.id as string) ?? ""}
              horizontal
              contentContainerStyle={tw`gap-4 items-end mb-1`}
            />
          )}

          {settings.others.previewLinks &&
            urls?.length === 1 &&
            attachments.length === 0 && (
              <LinkPreview
                text={urls[0]}
                renderHeader={() => null}
                renderText={() => null}
                metadataContainerStyle={tw`m-0 px-2 py-1 rounded-lg`}
                metadataTextContainerStyle={tw`flex-1 p-0 m-0`}
                containerStyle={[
                  tw`rounded-lg p-2 border-bd w-full flex-row-reverse`,
                ]}
                textContainerStyle={tw`flex-1 p-0 m-0`}
                enableAnimation
                renderMinimizedImage={() => null}
                renderTitle={(title) => (
                  <Text
                    style={[
                      tw`text-muted-foreground dark:text-dark-muted-foreground`,
                      {
                        fontFamily: fonts.inter.semiBold,
                      },
                    ]}
                  >
                    {title.length > 60 ? title.slice(0, 60) + "..." : title}
                  </Text>
                )}
                renderDescription={(description) => (
                  <Text
                    style={[
                      tw`text-xs text-muted-foreground dark:text-dark-muted-foreground`,
                    ]}
                  >
                    {description.length > 70
                      ? description.slice(0, 70) + "..."
                      : description}
                  </Text>
                )}
                renderImage={(image) => (
                  <View style={tw`flex flex-row`}>
                    <Image
                      source={{ uri: image.url }}
                      style={[
                        tw`h-24 w-24 rounded-lg mb-0`,
                        {
                          objectFit: "cover",
                        },
                      ]}
                    />
                  </View>
                )}
              />
            )}
        </View>
        {attachments.length > 1 ? (
          <Carousel
            loop={false}
            width={width}
            height={400}
            data={attachments.map((attachment) => ({
              uri: getPostAttachmentSource(attachment.path, author.id),
            }))}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            style={tw`-mt-5`}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            renderItem={({ item, index }) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  setAttachmentIndex(index);
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={[
                    tw`w-full`,
                    {
                      resizeMode: "cover",
                      borderRadius: 10,
                      height: 400,
                    },
                  ]}
                />

                {attachments[index].caption && (
                  <TouchableOpacity
                    style={tw`absolute bottom-4 right-4 bg-dark-muted p-2 rounded-full`}
                    onPress={() => {
                      Alert.alert(
                        t("common:caption"),
                        attachments[index].caption
                      );
                    }}
                  >
                    <ScanEyeIcon size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableWithoutFeedback>
            )}
          />
        ) : attachments.length === 1 ? (
          <TouchableWithoutFeedback
            onPress={() => {
              setAttachmentIndex(0);
            }}
            style={tw`mt-0`}
          >
            <Image
              source={{ uri: attachmentList[0].uri }}
              style={[
                tw`w-full`,
                {
                  resizeMode: "cover",
                  height: 400,
                },
              ]}
            />

            {attachments[0].caption && (
              <TouchableOpacity
                style={tw`absolute bottom-4 right-4 bg-dark-muted p-2 rounded-full`}
                onPress={() => {
                  Alert.alert(t("common:caption"), attachments[0].caption);
                }}
              >
                <ScanEyeIcon size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableWithoutFeedback>
        ) : null}
      </ConditionalWrapper>
    </View>
  );
}
