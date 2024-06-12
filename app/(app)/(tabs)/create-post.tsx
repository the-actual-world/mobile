import { View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";

export default function Index() {
  const { signOut } = useSupabase();

  return (
    <Background>
      <Text
        style={tw`h1 text-foreground dark:text-dark-foreground`}
        onPress={() => signOut()}
      >
        THIS PAGE IS JUST HERE FOR NO ERRORS, IT DOESNT DO ANYTHING
      </Text>
    </Background>
  );
}
