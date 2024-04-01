import { Slot } from "expo-router";
import * as React from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";
import tw from "@/lib/tailwind";
import { SupabaseProvider } from "@/context/SupabaseProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/constants/IMLocalize";
import {
  ColorSchemeProvider,
  useColorScheme,
} from "@/context/ColorSchemeProvider";
import { useDeviceContext } from "twrnc";
import MyStatusBar from "@/components/StatusBar";
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
// import Constants from "expo-constants";
import { AlertProvider } from "@/context/AlertProvider";
import { TimerProvider } from "@/context/TimerContext";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { NotificationsProvider } from "@/context/NotificationsProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Root() {
  useDeviceContext(tw, {
    initialColorScheme: "dark",
    observeDeviceColorSchemeChanges: false,
  });

  let [fontsLoaded, error] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    CursedTimer: require("@/assets/fonts/CursedTimerUlil-Aznm.ttf"),
  });

  React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  // React.useEffect(() => {
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ColorSchemeProvider>
      <TimerProvider>
        <GestureHandlerRootView style={tw`flex-1`}>
          <BottomSheetModalProvider>
            <AlertProvider>
              <SupabaseProvider>
                <NotificationsProvider>
                  <SafeAreaProvider>
                    <MyStatusBar />
                    <Slot />
                  </SafeAreaProvider>
                </NotificationsProvider>
              </SupabaseProvider>
            </AlertProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </TimerProvider>
    </ColorSchemeProvider>
  );
}
