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

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      initialRouteName="posts"
      screenOptions={{
        tabBarStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? tw.color("bg-dark-background")
              : tw.color("bg-background"),
          borderTopColor:
            colorScheme === "dark"
              ? tw.color("[#ffffff]/30")
              : tw.color("border"),
        },
        headerTintColor: tw.color("accent"),
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
            ? tw.color("dark-foreground/50")
            : tw.color("foreground/30"),
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
        name="messages"
        options={{
          href: {
            pathname: "/messages",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox" color={color} size={size} />
          ),
          headerTitle: t("common:messages"),
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
        }}
      />
    </Tabs>
  );
}
