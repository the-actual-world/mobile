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
        style={[tw`flex-1 items-center bg-new-bg pt-8 px-6`, style]}
      >
        {children}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[tw`flex-1 items-center bg-new-bg`]}>
      <ScrollView
        contentContainerStyle={tw`flex-grow items-center pt-8 pb-24 mx-6`}
        style={[tw`w-full`, style]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
