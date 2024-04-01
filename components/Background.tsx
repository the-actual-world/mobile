import tw from "@/lib/tailwind";
import React from "react";
import { SafeAreaView, ScrollView } from "react-native";

export function Background({
  children,
  style,
  showScroll = true,
}: {
  children: React.ReactNode;
  style?: any;
  showScroll?: boolean;
}) {
  if (!showScroll) {
    return (
      <SafeAreaView
        style={[
          tw`flex-1 bg-new-background dark:bg-dark-new-background pt-8 px-6`,
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={[tw`flex-1 bg-new-background dark:bg-dark-new-background`]}
    >
      <ScrollView
        contentContainerStyle={tw`flex-grow pt-8 pb-24 mx-6`}
        style={[tw`w-full`, style]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
