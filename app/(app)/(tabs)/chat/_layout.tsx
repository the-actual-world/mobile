import tw from "@/lib/tailwind";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";

export default () => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack
        screenOptions={{
          headerTintColor: tw.color("accent"),
          headerTitle: t("common:messages"),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("background"),
          },
          headerRight: () => <Timer style={tw`mr-0`} />,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="messages/[id]"
          options={{
            headerTitle: t("common:messages"),
          }}
        />
      </Stack>
    </>
  );
};
