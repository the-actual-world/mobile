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
import { Feather, Ionicons } from "@expo/vector-icons";
import tw from "@/lib/tailwind";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as FileSystem from "expo-file-system";
import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { CreditsProvider, useCredits } from "@/context/CreditsProvider";
import Avatar from "@/components/Avatar";
import { FriendsProvider, useFriends } from "@/context/FriendsProvider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { fonts } from "@/lib/styles";
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import {
  CameraIcon,
  CogIcon,
  DicesIcon,
  HomeIcon,
  HourglassIcon,
  ImagesIcon,
  MessageSquareIcon,
  PaperclipIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react-native";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { FlatList } from "react-native-gesture-handler";
import { useAlert } from "@/context/AlertProvider";
import ManagePostModalContent from "@/components/modal-content/CreatePost";
import { constants } from "@/constants/constants";
import { useSettings } from "@/context/SettingsProvider";

function getFocusedName(name: string, focused: boolean): any {
  return focused ? name : name + "-outline";
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();
  const segments = useSegments();
  const { bottom } = useSafeAreaInsets();
  const { session, user } = useSupabase();
  const alertRef = useAlert();
  const { settings } = useSettings();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const newPostKeyboardRef = React.useRef<TextInput>(null);
  const snapPoints = React.useMemo(() => ["100%"], []);
  const router = useRouter();

  const { friends } = useFriends();

  // const backHandler = React.useRef<NativeEventSubscription | null>(null);

  // const handleBackPress = React.useCallback(() => {
  //   clearNewPost();
  //   bottomSheetModalRef.current?.dismiss();
  //   return true;
  // }, [bottomSheetModalRef]);

  // backHandler.current = BackHandler.addEventListener(
  //   "hardwareBackPress",
  //   handleBackPress
  // );

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
        <ManagePostModalContent
          onClose={() => {
            bottomSheetModalRef.current?.dismiss();
          }}
          newPostKeyboardRef={newPostKeyboardRef}
          session={session}
          settings={settings}
          friends={friends}
        />
      </BottomSheetModal>

      <ActionSheetProvider>
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
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={getFocusedName("home", focused)}
                  color={color}
                  size={size}
                />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              href: {
                pathname: "/chat",
              },
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={getFocusedName("chatbox", focused)}
                  color={color}
                  size={size}
                />
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
                    name="add"
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
            name="rewind"
            options={{
              href: {
                pathname: "/rewind",
              },
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={getFocusedName("play-back", focused)}
                  color={color}
                  size={size}
                />
              ),
              headerTitle: t("common:rewind"),
              headerRight: () => (
                <TouchableOpacity
                  style={tw`mr-4`}
                  onPress={async () => {
                    const { data, error } = await sb
                      .from("random_posts_where_i_am")
                      .select("*")
                      .limit(1);

                    if (error) {
                      console.error(error);
                      return;
                    }

                    if (data.length === 0) {
                      alertRef.current?.showAlert({
                        title: t("rewind:noPosts"),
                        variant: "destructive",
                      });
                      return;
                    }

                    alertRef.current?.showAlert({
                      title: t("rewind:goingToRandomPost"),
                      variant: "info",
                    });

                    router.push("/home/post/" + data[0].id);
                  }}
                >
                  <DicesIcon
                    size={24}
                    color={
                      colorScheme === "dark"
                        ? tw.color("dark-foreground")
                        : tw.color("foreground")
                    }
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: {
                pathname: "/settings",
              },
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={getFocusedName("settings", focused)}
                  color={color}
                  size={size}
                />
              ),
              headerTitle: t("common:settings"),
              headerShown: false,
            }}
          />
        </Tabs>
      </ActionSheetProvider>
    </>
  );
}
