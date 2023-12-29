import { Text as RNText } from "react-native";
import React from "react";
import tw from "@/lib/tailwind";

export const Text = (props: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) => (
  <RNText
    {...props}
    style={[
      { fontFamily: "Inter_400Regular" },
      tw`text-foreground dark:text-dark-foreground`,
      props.style,
    ]}
    onPress={props.onPress}
  >
    {props.children}
  </RNText>
);
