import { View, Text } from "react-native";
import React from "react";
import { Slot, Stack } from "expo-router";
import { useColorScheme } from "@/context/ColorSchemeProvider";
// import { HoldMenuProvider } from "react-native-hold-menu";

const _layout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      {/* <HoldMenuProvider theme={colorScheme}> */}
      <Slot />
      {/* </HoldMenuProvider> */}
    </>
  );
};

export default _layout;
