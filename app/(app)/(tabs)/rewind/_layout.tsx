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
          name="summaries"
          options={{
            title: t("rewind:summaries"),
          }}
        />
        <MaterialTopTabs.Screen
          name="location"
          options={{
            title: t("rewind:location"),
          }}
        />
        <MaterialTopTabs.Screen
          name="random"
          options={{
            title: t("rewind:random"),
          }}
        />
      </MaterialTopTabs>
    </>
  );
};
