import { useColorScheme } from "@/context/ColorSchemeProvider";
import tw from "@/lib/tailwind";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function Loading({ visible }: { visible: boolean }) {
  const { colorScheme } = useColorScheme();
  return visible ? (
    <ActivityIndicator
      size={"large"}
      color={
        colorScheme === "dark" ? tw.color("accent") : tw.color("dark-accent")
      }
    />
  ) : null;
}
