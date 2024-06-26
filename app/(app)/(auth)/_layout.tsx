import tw from "@/lib/tailwind";
import { Stack } from "expo-router";
import * as React from "react";

export default function AuthLayout() {
  return (
    <Stack
      key={tw.memoBuster}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
