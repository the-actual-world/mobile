import { useSupabase } from "@/context/useSupabase";
import tw from "@/lib/tailwind";
import React from "react";
import { useState, useEffect } from "react";
import { View, Image } from "react-native";
import { Text } from "./ui/Text";
import { t } from "i18next";

interface Props {
  size: number;
  userId: string;
}

export default function Avatar({ size = 150, userId: userId }: Props) {
  const avatarSize = { height: size, width: size };
  const [avatarUrl, setAvatarUrl] = useState<string | null | object>(null);

  const { sb } = useSupabase();

  useEffect(() => {
    setAvatarUrl(
      sb.storage.from("avatars").getPublicUrl(`${userId}/icon.jpg`)?.data
        ?.publicUrl || null
    );
  }, []);

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl as string }}
          accessibilityLabel="Avatar"
          onError={(e) => {
            console.log("Error loading avatar: ", e);
            setAvatarUrl(null);
          }}
          style={[
            avatarSize,
            tw`rounded-full`,
            {
              objectFit: "cover",
              width: size,
              height: size,
            },
          ]}
        />
      ) : (
        <Image
          source={require("../assets/avatar-placeholder.jpg")}
          accessibilityLabel="No Avatar"
          style={[
            avatarSize,
            tw`rounded-full`,
            {
              width: size,
              height: size,
            },
          ]}
        />
      )}
    </View>
  );
}
