import { sb, useSupabase } from "@/context/SupabaseProvider";
import tw from "@/lib/tailwind";
import { Link, useRouter } from "expo-router";
import React from "react";
import { useState, useEffect } from "react";
import { View, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props {
  size: number;
  userId: string;
}

export default function Avatar({ size = 150, userId: userId }: Props) {
  const avatarSize = { height: size, width: size };
  const [avatarUrl, setAvatarUrl] = useState<string | null | object>(null);
  const router = useRouter();

  useEffect(() => {
    setAvatarUrl(
      sb.storage.from("avatars").getPublicUrl(`${userId}/icon.jpg`)?.data
        ?.publicUrl +
        "?" +
        new Date() || null
    );
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/home/user/${userId}`);
      }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl as string }}
          accessibilityLabel="Avatar"
          onError={(e) => {
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
          source={require("../assets/images/avatar-placeholder.jpg")}
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
    </TouchableOpacity>
  );
}
