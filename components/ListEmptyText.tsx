import React from "react";
import tw from "@/lib/tailwind";
import { Text } from "./ui/Text";
import { View } from "react-native";

export default function ListEmptyText({ text }: { text: string }) {
  return (
    <View style={tw`flex-1 items-center justify-center mt-3`}>
      <Text style={tw`text-center`} muted>
        {text}
      </Text>
    </View>
  );
}
