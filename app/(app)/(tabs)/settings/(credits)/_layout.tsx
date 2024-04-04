import tw from "@/lib/tailwind";
import { Stack, withLayoutContext } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { TabNavigationState, ParamListBase } from "@react-navigation/native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default () => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = React.useState(false);

  const { colorScheme } = useColorScheme();

  return (
    <>
      <MaterialTopTabs
        id={tw.memoBuster}
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
          name="explain-credits"
          options={{
            title: t("settings:explain"),
          }}
        />
        <MaterialTopTabs.Screen
          name="gift-credits"
          options={{
            title: t("settings:give"),
          }}
        />
      </MaterialTopTabs>
    </>
  );
};
