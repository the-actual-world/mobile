import { useColorScheme } from "@/context/ColorSchemeProvider";
import tw from "@/lib/tailwind";
import React, { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";

export function Background({
  children,
  style,
  showScroll = true,
  noPadding = false,
}: {
  children: React.ReactNode;
  style?: any;
  showScroll?: boolean;
  noPadding?: boolean;
}) {
  if (!showScroll) {
    if (noPadding) {
      return (
        <SafeAreaView style={[tw`flex-1 bg-bg`, style]}>
          {children}
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[tw`flex-1 bg-bg pt-7 px-6`, style]}>
        {children}
      </SafeAreaView>
    );
  }
  if (noPadding) {
    return (
      <SafeAreaView style={[tw`flex-1 bg-bg`, style]}>
        <ScrollView style={[tw`w-full`]}>{children}</ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[tw`flex-1 bg-bg`]}>
      <ScrollView
        contentContainerStyle={tw`flex-grow pt-7 pb-24 mx-6`}
        style={[tw`w-full`, style]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
