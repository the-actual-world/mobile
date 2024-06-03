import {
  Redirect,
  Stack,
  Tabs,
  useNavigation,
  useRouter,
  useSegments,
} from "expo-router";
import React, { useEffect } from "react";
// import icons
import { Feather } from "@expo/vector-icons";
import tw from "@/lib/tailwind";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import * as FileSystem from "expo-file-system";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  NativeEventSubscription,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
//@ts-ignore
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { CreditsProvider, useCredits } from "@/context/CreditsProvider";
import Avatar from "@/components/Avatar";
import { FriendsProvider } from "@/context/FriendsProvider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { fonts } from "@/lib/styles";
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import {
  CameraIcon,
  ImagesIcon,
  MapPinIcon,
  PaperclipIcon,
  TrashIcon,
} from "lucide-react-native";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";
import { useAlert } from "@/context/AlertProvider";
import ChooseLocationModalContent from "./ChooseLocation";
import { Session } from "@supabase/supabase-js";
import { LocationUtils } from "@/lib/utils";
import { useLocation } from "@/context/LocationProvider";

export default function ManagePostModalContent({
  onClose,
  newPostKeyboardRef,
  existingPostId = null,
  session = null,
}: {
  onClose: () => void;
  newPostKeyboardRef: React.RefObject<TextInput>;
  existingPostId?: string | null;
  session?: Session | null;
}) {
  const alertRef = useAlert();
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();

  const [newPostText, setNewPostText] = React.useState("");
  const [newPostImages, setNewPostImages] = React.useState<
    { path: string; media_type: string; caption: string }[]
  >([]);
  const [newPostLocation, setNewPostLocation] = React.useState<null | {
    latitude: number;
    longitude: number;
    name: string;
  }>(null);

  const [uploadingAttachment, setUploadingAttachment] = React.useState(false);

  const bottomSheetChooseLocationModalRef =
    React.useRef<BottomSheetModal>(null);
  const snapPointsChooseLocation = React.useMemo(() => ["70%"], []);

  useEffect(() => {
    if (existingPostId) {
      // Fetch the existing post data
      fetchPostData(existingPostId);
    }
  }, [existingPostId]);

  async function fetchPostData(postId: string) {
    try {
      const { data, error } = await sb
        .from("posts")
        .select("text, location, post_attachments(path, media_type, caption)")
        .eq("id", postId)
        .single();

      if (error) throw error;
      if (!data) return;

      if (data.text) {
        setNewPostText(data.text);
      }
      if (data.location) {
        const parsedLocation = LocationUtils.parseLocation(
          data.location as string
        );
        if (parsedLocation) {
          setNewPostLocation({
            ...parsedLocation,
            name: await LocationUtils.getLocationName(
              parsedLocation,
              i18n.language
            ),
          });
        }
      }
      setNewPostImages(data.post_attachments || []);
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  }

  async function storeImage(file: ImagePicker.ImagePickerResult) {
    if (file.assets && file.assets.length > 0) {
      setUploadingAttachment(true);

      const newImages = await Promise.all(
        file.assets.map(async (asset) => {
          const fileExt = asset.uri.split(".").pop();
          const filePath = `${new Date().getTime()}.${fileExt}`;
          const contentType =
            (asset.type === "image" ? "image/" : "video/") + fileExt;
          const fullFilePath = `${session?.user.id}/${filePath}`;

          console.log("Uploading image", fullFilePath, contentType);

          // upload the image
          const { data, error } = await sb.storage
            .from("post_attachments")
            .upload(fullFilePath, decode(asset.base64 as string), {
              cacheControl: "3600",
              upsert: false,
              contentType,
            });
          if (error) {
            console.error(error);
            return null;
          }

          // generate caption
          const result = await sb.functions.invoke("generate-caption", {
            body: {
              url: sb.storage
                .from("post_attachments")
                .getPublicUrl(fullFilePath).data.publicUrl,
              userLanguage: i18n.language,
            },
          });
          if (result.error) {
            console.error(result.error);
            return null;
          }
          const caption: string = result.data.caption;

          return {
            path: filePath,
            media_type: asset.type,
            caption: caption,
          };
        })
      );

      const validImages = newImages.filter((image) => image !== null) as {
        path: string;
        media_type: string;
        caption: string;
      }[];

      setNewPostImages((prev) => [...prev, ...validImages]);
      setUploadingAttachment(false);
    }
  }

  function clearNewPost() {
    setNewPostText("");
    setNewPostImages([]);
  }

  async function deleteImage(index: number) {
    const image = newPostImages[index];
    const fullFilePath = `${session?.user.id}/${image.path}`;
    const { error, data } = await sb.storage
      .from("post_attachments")
      .remove([fullFilePath]);
    console.log(data, fullFilePath);
    if (error) {
      console.error(error);
      return;
    }
    setNewPostImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function createOrUpdatePost() {
    if (existingPostId) {
      // Update the existing post
      const { data, error } = await sb
        .from("posts")
        .update({
          text: newPostText,
          location: newPostLocation
            ? LocationUtils.stringifyLocation(newPostLocation)
            : null,
        })
        .eq("id", existingPostId)
        .select();

      if (error) {
        console.error(error);
        return;
      }

      const post = data[0];

      // delete all existing images
      await sb.from("post_attachments").delete().eq("post_id", post.id);

      // Update images
      await Promise.all(
        newPostImages.map(async (image) => {
          await sb.from("post_attachments").upsert([
            {
              post_id: post.id,
              path: image.path,
              caption: image.caption,
              media_type: image.media_type === "image" ? "image" : "video",
            },
          ]);
        })
      );
    } else {
      // Create a new post
      const { data: posts, error } = await sb
        .from("posts")
        .insert([
          {
            text: newPostText,
            location: newPostLocation
              ? LocationUtils.stringifyLocation(newPostLocation)
              : null,
          },
        ])
        .select();

      if (error) {
        console.error(error);
        return;
      }

      const post = posts[0];

      // Post images
      await Promise.all(
        newPostImages.map(async (image) => {
          await sb.from("post_attachments").insert([
            {
              post_id: post.id,
              path: image.path,
              caption: image.caption,
              media_type: image.media_type === "image" ? "image" : "video",
            },
          ]);
        })
      );
    }

    // Clear the new post text
    clearNewPost();
    onClose();
  }

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetChooseLocationModalRef}
        index={0}
        snapPoints={snapPointsChooseLocation}
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
        <ChooseLocationModalContent
          onClose={() => {
            bottomSheetChooseLocationModalRef.current?.dismiss();
          }}
          onLocationSelect={(location: any) => {
            console.log("Location selected", location);
            setNewPostLocation(location);
          }}
        />
      </BottomSheetModal>

      <View
        style={[
          tw`flex-1`,
          existingPostId
            ? tw`bg-background dark:bg-dark-background px-4 pt-4`
            : tw``,
        ]}
      >
        <View style={tw`flex-1`}>
          <View
            style={tw`flex-row justify-between border-b border-foreground/5 dark:border-dark-foreground/15 pb-3 mb-3`}
          >
            <Button
              label={t("common:cancel")}
              variant="link"
              onPress={() => {
                clearNewPost();
                onClose();
              }}
            />
            <Button
              label={existingPostId ? t("common:save") : t("common:post")}
              disabled={
                newPostText.trim().length === 0 && newPostImages.length === 0
              }
              onPress={createOrUpdatePost}
            />
          </View>

          <TextInput
            placeholder={t("common:write-something")}
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            ref={newPostKeyboardRef}
            placeholderTextColor={
              colorScheme === "dark"
                ? tw.color("dark-foreground/40")
                : tw.color("foreground/40")
            }
            style={tw`text-foreground dark:text-dark-foreground text-lg`}
          />

          <View style={tw`mt-16`}>
            {uploadingAttachment && (
              <View style={tw`flex-row items-center mb-4`}>
                <ActivityIndicator
                  size="small"
                  color={
                    colorScheme === "dark"
                      ? tw.color("dark-foreground/40")
                      : tw.color("foreground/40")
                  }
                />
                <Text
                  style={tw`text-foreground dark:text-dark-foreground ml-2`}
                >
                  {t("common:uploading-attachment")}
                </Text>
              </View>
            )}

            <FlatList
              horizontal
              data={newPostImages}
              renderItem={({ item, index }) => (
                <View style={tw`relative w-45 h-45 mr-2 mb-2 rounded-lg`}>
                  <Image
                    source={{
                      uri: sb.storage
                        .from("post_attachments")
                        .getPublicUrl(`${session?.user.id}/${item.path}`).data
                        .publicUrl,
                    }}
                    style={[tw`w-full h-full rounded-lg`]}
                    contentFit="cover"
                  />
                  <View
                    style={tw`absolute bottom-0 left-0 right-0 bg-dark-background bg-opacity-60 px-2 py-1`}
                  >
                    <TextInput
                      style={tw`text-background text-sm`}
                      value={item.caption}
                      onChangeText={(text) => {
                        setNewPostImages((prev) =>
                          prev.map((image, i) =>
                            i === index ? { ...image, caption: text } : image
                          )
                        );
                      }}
                      placeholderTextColor={tw.color("background/70")}
                      placeholder={t("common:enter-caption")}
                      multiline
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteImage(index)}
                    style={tw`absolute top-2 right-2`}
                  >
                    <Text style={tw`bg-destructive px-1 py-1 rounded-lg`}>
                      <TrashIcon
                        size={16}
                        color={tw.color("background")}
                        strokeWidth={2.5}
                      />
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>

        <KeyboardAvoidingView behavior="padding">
          <View style={tw`flex-row items-center mb-22 pt-2 gap-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center gap-2 px-2 py-2 bg-background dark:bg-dark-background rounded-xl`}
              onPress={async () => {
                const { status } =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.75,
                  base64: true,
                  allowsMultipleSelection: true,
                });
                if (result.canceled) return;

                await storeImage(result);
              }}
              disabled={uploadingAttachment}
            >
              <PaperclipIcon
                size={24}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-foreground/40")
                    : tw.color("foreground/40")
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`flex-row items-center gap-2 px-2 py-2 bg-background dark:bg-dark-background rounded-xl`}
              onPress={async () => {
                const { status } =
                  await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.75,
                  base64: true,
                  allowsMultipleSelection: true,
                });
                if (result.canceled) return;

                await storeImage(result);
              }}
              disabled={uploadingAttachment}
            >
              <CameraIcon
                size={24}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-foreground/40")
                    : tw.color("foreground/40")
                }
              />
            </TouchableOpacity>

            {!newPostLocation ? (
              <TouchableOpacity
                style={tw`flex-row items-center gap-2 px-2 py-2 bg-background dark:bg-dark-background rounded-xl`}
                onPress={async () => {
                  bottomSheetChooseLocationModalRef.current?.present();
                }}
              >
                <MapPinIcon
                  size={24}
                  color={
                    colorScheme === "dark"
                      ? tw.color("dark-foreground/40")
                      : tw.color("foreground/40")
                  }
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={tw`flex-row items-center gap-2 px-2 py-2`}
                onPress={() => {
                  setNewPostLocation(null);
                }}
              >
                <MapPinIcon
                  size={24}
                  color={
                    colorScheme === "dark"
                      ? tw.color("dark-foreground/40")
                      : tw.color("foreground/40")
                  }
                />
                <Text style={tw`text-foreground dark:text-dark-foreground`}>
                  {newPostLocation.name}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
