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
import {
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  NativeEventSubscription,
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
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { fonts } from "@/lib/styles";
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import { CameraIcon, ImagesIcon } from "lucide-react-native";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const { bottom } = useSafeAreaInsets();
  const { totalCredits } = useCredits();
  const { session, user } = useSupabase();
  const [newPostText, setNewPostText] = React.useState("");

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

  function clearNewPost() {
    setNewPostText("");
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
          </View>

          <KeyboardAvoidingView behavior="padding">
            <View style={tw`flex-row items-center mb-22`}>
              <TouchableOpacity
                style={tw`flex-row items-center gap-2 px-3 py-2 bg-background dark:bg-dark-background rounded-xl`}
                onPress={() => {
                  // setSelectedFriendIdToGive(item.user.id);
                  // bottomSheetModalRef.current?.present();
                }}
              >
                <ImagesIcon
                  size={24}
                  color={
                    colorScheme === "dark"
                      ? tw.color("dark-foreground/40")
                      : tw.color("foreground/40")
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-row items-center gap-2 px-3 py-2 bg-background dark:bg-dark-background rounded-xl`}
                onPress={() => {
                  // setSelectedFriendIdToGive(item.user.id);
                  // bottomSheetModalRef.current?.present();
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
