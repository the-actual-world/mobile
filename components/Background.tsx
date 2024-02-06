import tw from "@/lib/tailwind";
import React from "react";
import { SafeAreaView } from "react-native";

export function Background({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <SafeAreaView style={[tw`flex-1 items-center bg-new-bg pt-12 px-6`, style]}>
      {children}
    </SafeAreaView>
  );
}
