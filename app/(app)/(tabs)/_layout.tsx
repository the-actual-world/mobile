import {
  Redirect,
  Stack,
  Tabs,
  useNavigation,
  useRouter,
  useSegments,
} from "expo-router";
import React from "react";
// import icons
import { Ionicons, Feather } from "@expo/vector-icons";
import tw from "@/lib/tailwind";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import * as FileSystem from "expo-file-system";
import {
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
import { HoldMenuProvider } from "react-native-hold-menu";
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
  PaperclipIcon,
  TrashIcon,
} from "lucide-react-native";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const segments = useSegments();
  const { bottom } = useSafeAreaInsets();
  const { session, user } = useSupabase();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const newPostKeyboardRef = React.useRef<TextInput>(null);
  const snapPoints = React.useMemo(() => ["100%"], []);

  const backHandler = React.useRef<NativeEventSubscription | null>(null);

  const handleBackPress = React.useCallback(() => {
    clearNewPost();
    bottomSheetModalRef.current?.dismiss();
    return true;
  }, [bottomSheetModalRef]);

  backHandler.current = BackHandler.addEventListener(
    "hardwareBackPress",
    handleBackPress
  );

  const [newPostText, setNewPostText] = React.useState("");
  const [newPostImages, setNewPostImages] = React.useState<
    { path: string; media_type: string; caption: string }[]
  >([]);

  async function storeImage(file: ImagePicker.ImagePickerResult) {
    if (file.assets && file.assets.length > 0) {
      const newImages = await Promise.all(
        file.assets.map(async (asset) => {
          const fileExt = asset.uri.split(".").pop();
          console.log("Just here");
          const filePath = `${new Date().getTime()}.${fileExt}`;
          const contentType =
            (asset.type === "image" ? "image/" : "video/") + fileExt;
          const fullFilePath = `${session?.user.id}/${filePath}`;
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
          console.log(JSON.stringify(result));
          const caption = result.data.caption;

          console.log(caption);

          return {
            path: filePath,
            media_type: asset.type,
            caption,
          };
        })
      );

      const validImages = newImages.filter((image) => image !== null) as {
        path: string;
        media_type: string;
      }[];

      setNewPostImages((prev) => [...prev, ...validImages]);
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

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-bg`}
        handleIndicatorStyle={tw`bg-mt-fg`}
        style={tw`px-4 py-3 mt-10`}
      >
        <View style={tw`flex-1`}>
          <View style={tw`flex-1`}>
            <View
              style={tw`flex-row justify-between border-b border-foreground/5 dark:border-dark-foreground/15 pb-3 mb-3`}
            >
              <Button
                label={t("common:cancel")}
                variant="link"
                onPress={() => {
                  clearNewPost();
                  bottomSheetModalRef.current?.dismiss();
                }}
              />
              <Button
                label={t("common:post")}
                disabled={!newPostText}
                onPress={() => {
                  // post new post

                  // clear the new post text
                  clearNewPost();
                  bottomSheetModalRef.current?.dismiss();
                }}
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

            <FlatList
              horizontal
              contentContainerStyle={tw`mt-16`}
              data={newPostImages}
              renderItem={({ item, index }) => (
                <View style={tw`relative w-34 h-34 mr-2 mb-2 rounded-lg`}>
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
                    style={tw`absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 px-2 py-1`}
                  >
                    <Text style={tw`text-white text-sm`}>{item.caption}</Text>
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

          <KeyboardAvoidingView behavior="padding">
            <View style={tw`flex-row items-center mb-21 pt-2`}>
              <TouchableOpacity
                style={tw`flex-row items-center gap-2 px-2 py-2 mr-2 bg-background dark:bg-dark-background rounded-xl`}
                onPress={async () => {
                  const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== "granted") {
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    quality: 0.75,
                    base64: true,
                    allowsMultipleSelection: true,
                  });
                  if (result.canceled) return;

                  await storeImage(result);
                }}
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
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    quality: 0.75,
                    base64: true,
                    allowsMultipleSelection: true,
                  });
                  if (result.canceled) return;

                  await storeImage(result);
                }}
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
            </View>
          </KeyboardAvoidingView>
        </View>
      </BottomSheetModal>

      <HoldMenuProvider
        theme={colorScheme}
        style={{
          width: "100%",
          flex: 1,
        }}
        paddingBottom={bottom}
        iconComponent={Feather}
      >
        <Tabs
          key={tw.memoBuster}
          initialRouteName="home"
          screenOptions={{
            tabBarStyle: {
              zIndex: 1,
              backgroundColor:
                colorScheme === "dark"
                  ? tw.color("dark-background")
                  : tw.color("background"),
              position: "absolute",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderColor: tw.color("transparent"),
              shadowColor: colorScheme === "dark" ? "#fff" : "#000",
              shadowOffset: {
                width: 0,
                height: 20,
              },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 10,
              display: ["messages", "manage"].includes(segments[3])
                ? "none"
                : "flex",
            },
            headerTintColor: tw.color("accent"),
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor:
                colorScheme === "dark"
                  ? tw.color("dark-background")
                  : tw.color("background"),
            },
            headerRight: () => (
              <>
                <Timer />
              </>
            ),
            // headerShown: false,
            tabBarAllowFontScaling: true,
            tabBarActiveTintColor: tw.color("accent"),
            tabBarInactiveTintColor:
              colorScheme === "dark"
                ? tw.color("dark-foreground/20")
                : tw.color("foreground/20"),
            tabBarShowLabel: false,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              href: {
                pathname: "/home",
              },
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
              headerTitle: t("common:posts"),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              href: {
                pathname: "/chat",
              },
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbox" color={color} size={size} />
              ),
              headerTitle: t("common:messages"),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="create-post"
            options={{
              tabBarIcon: ({ color, size }) => (
                <View
                  style={tw`absolute -top-4 w-16 h-16 rounded-full bg-accent justify-center items-center border-[1.3] border-new-background dark:border-dark-new-background`}
                >
                  <Ionicons
                    name="add-outline"
                    color={
                      colorScheme === "dark"
                        ? tw.color("dark-background")
                        : tw.color("background")
                    }
                    size={32}
                  />
                </View>
              ),
              headerTitle: t("common:create-post"),
            }}
            listeners={() => ({
              tabPress: (e) => {
                e.preventDefault();
                bottomSheetModalRef.current?.present();
                setTimeout(() => {
                  newPostKeyboardRef.current?.focus();
                }, 100);
              },
            })}
          />
          <Tabs.Screen
            name="rewind/index"
            options={{
              href: {
                pathname: "/rewind",
              },
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="play-back" color={color} size={size} />
              ),
              headerTitle: t("common:rewind"),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: {
                pathname: "/settings",
              },
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" color={color} size={size} />
              ),
              headerTitle: t("common:settings"),
              headerShown: false,
            }}
          />
        </Tabs>
      </HoldMenuProvider>
    </>
  );
}
