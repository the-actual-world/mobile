import { View, Text, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";

import { ViewStyle, StyleProp } from "react-native";

export default function CoolBottomSheet(
  props: React.ComponentProps<typeof BottomSheet>
) {
  return (
    <BottomSheet
      {...props}
      style={StyleSheet.compose(
        {
          backgroundColor: "red",
        },
        props.style as StyleProp<ViewStyle>
      )}
    />
  );
}
