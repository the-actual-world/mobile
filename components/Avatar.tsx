import { useSupabase } from "@/context/useSupabase";
import tw from "@/lib/tailwind";
import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Image, TouchableOpacity } from "react-native";
import { Button } from "./ui/Button";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { random_uuid } from "@/lib/utils";

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  const { sb } = useSupabase();

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await sb.storage.from("avatars").download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result;

      const photo = {
        uri: file.assets[0].base64 as string,
        type: file.assets[0].type,
        name: file.assets[0].uri.split("/").pop() || "avatar",
      };

      const fileExt = photo.name.split(".").pop();
      const filePath = `${random_uuid()}.${fileExt}`;

      const { error } = await sb.storage
        .from("avatars")
        .upload(filePath, decode(photo.uri), {
          contentType: photo.type,
        });

      if (error) {
        throw error;
      }

      onUpload(filePath);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error uploading image", error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={tw`mb-2`}>
      <TouchableOpacity onPress={uploadAvatar}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            accessibilityLabel="Avatar"
            style={[
              avatarSize,
              tw`rounded-lg max-w-full mx-auto`,
              { objectFit: "cover" },
            ]}
          />
        ) : (
          <View
            style={[
              avatarSize,
              tw`rounded-lg max-w-full mx-auto bg-muted dark:bg-dark-muted border border-muted-foreground dark:border-dark-muted-foreground`,
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
