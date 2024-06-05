import tw from "@/lib/tailwind";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { MaterialTopTabs } from "@/lib/utils";
import { Linking } from "react-native";

export default () => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = React.useState(false);

  const { colorScheme } = useColorScheme();

  return (
    <>
      <MaterialTopTabs
        key={tw.memoBuster}
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: tw.color("accent"),
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("background"),
          },
          tabBarLabelStyle: {
            color:
              colorScheme === "dark"
                ? tw.color("dark-foreground")
                : tw.color("foreground"),
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="manage-credits"
          options={{
            title: t("settings:manage"),
          }}
        />
        <MaterialTopTabs.Screen
          name="gift-credits"
          options={{
            title: t("settings:gift"),
          }}
        />
        <MaterialTopTabs.Screen
          // name="explain-credits"
          options={{
            title: t("settings:explain"),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              Linking.openURL(process.env.EXPO_PUBLIC_WEBSITE_URL + "/pricing");
            },
          })}
        />
      </MaterialTopTabs>
    </>
  );
};
