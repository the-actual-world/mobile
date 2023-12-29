import { View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";

export default function Index() {
  const { signOut } = useSupabase();

  return (
    <View
      style={tw`flex-1 items-center justify-center bg-background dark:bg-dark-background`}
    >
      <Text
        style={tw`h1 text-foreground dark:text-dark-foreground`}
        onPress={() => signOut()}
      >
        Sign Out
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontWeight: "700",
          fontSize: 24,
        }}
      >
        Sign out
      </Text>
    </View>
  );
}
