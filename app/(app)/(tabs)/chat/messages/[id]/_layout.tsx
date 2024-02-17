import { View, Text } from "react-native";
import React from "react";
import { Slot, Stack } from "expo-router";
import { useColorScheme } from "@/context/ColorSchemeProvider";

const _layout = () => {
  return (
    <>
      <Slot />
    </>
  );
};

export default _layout;
