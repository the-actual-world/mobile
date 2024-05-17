import { Text as RNText } from "react-native";
import React from "react";
import tw from "@/lib/tailwind";

export const Text = (props: {
  children?: React.ReactNode;
  style?: any;
  onPress?: () => void;
  muted?: boolean;
}) => (
  <RNText
    {...props}
    style={[
      { fontFamily: "Inter_400Regular" },
      tw`text-foreground dark:text-dark-foreground`,
      props.muted && tw`text-muted-foreground dark:text-dark-muted-foreground`,
      props.style,
    ]}
    onPress={props.onPress}
  >
    {props.children}
  </RNText>
);
