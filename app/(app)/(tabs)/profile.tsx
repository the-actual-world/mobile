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
        style={tw`h1 text-foreground dark:text-dark-foreground`}
        onPress={() => signOut()}
      >
        Sign Out
      </Text>
    </Background>
  );
}
