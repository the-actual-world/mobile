import tw from "@/lib/tailwind";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { MaterialTopTabs } from "@/lib/utils";
import { View } from "react-native";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { fonts } from "@/lib/styles";
import Avatar from "@/components/Avatar";
import { Timer } from "@/components/Timer";

export default () => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = React.useState(false);

  const { colorScheme } = useColorScheme();
  const { id } = useLocalSearchParams();

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
          name="posts"
          options={{
            title: t("common:posts"),
          }}
        />
        <MaterialTopTabs.Screen
          name="media"
          options={{
            title: t("common:media"),
          }}
        />
      </MaterialTopTabs>
    </>
  );
};
