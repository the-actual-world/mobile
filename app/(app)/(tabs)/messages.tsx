import { View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import { Background } from "@/components/Background";

export default function Index() {
  const { signOut } = useSupabase();

  return (
    <Background>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontWeight: "700",
          fontSize: 24,
        }}
      >
        Sign out
      </Text>
    </Background>
  );
}
