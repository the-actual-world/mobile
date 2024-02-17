import { Stack, Tabs, useNavigation, useSegments } from "expo-router";
import React from "react";
// import icons
import { Ionicons } from "@expo/vector-icons";
import tw from "@/lib/tailwind";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { View } from "react-native";
//@ts-ignore
import { HoldMenuProvider } from "react-native-hold-menu";
import FeatherIcon from "react-native-vector-icons/Feather";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const segments = useSegments();

  return (
    <HoldMenuProvider
      theme={colorScheme}
      style={{
        width: "100%",
        flex: 1,
      }}
      iconComponent={FeatherIcon}
    >
      <Tabs
        initialRouteName="posts"
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
            display: segments[3] === "messages" ? "none" : "flex",
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
          name="posts"
          options={{
            href: {
              pathname: "/posts",
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
                style={tw`absolute -top-8 w-16 h-16 rounded-full bg-accent justify-center items-center border-[1.3] border-new-background dark:border-dark-new-background`}
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
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: {
              pathname: "/profile",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
            headerTitle: t("common:profile"),
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
  );
}
