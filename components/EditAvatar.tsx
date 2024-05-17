import { sb, useSupabase } from "@/context/SupabaseProvider";
import tw from "@/lib/tailwind";
import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, TouchableOpacity, Image } from "react-native";
import { Button } from "./ui/Button";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { randomUUID } from "@/lib/utils";
// import { Image } from "expo-image";
import { Text } from "./ui/Text";
import { t } from "i18next";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

interface Props {
  size: number;
  onUpload: (filePath: string) => void;
}

export default function AvatarEdit({ size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const avatarSize = { height: size, width: size };
  const [avatarUrl, setAvatarUrl] = useState<string | null | object>(null);

  const { session } = useSupabase();

  const [random_id, setRandomId] = useState("");

  // useEffect(() => {
  //   setAvatarUrl(
  //     sb.storage.from("avatars").getPublicUrl(`${user?.id}/icon.jpg`)?.data
  //       ?.publicUrl || null
  //   );
  // }, []);

  useEffect(() => {
    downloadImage(`${session?.user?.id}/icon.jpg`);
  }, [random_id]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await sb.storage
        .from("avatars")
        .download(path + "?" + new Date());

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
        type: "image/jpeg",
        name: file.assets[0].uri.split("/").pop() || "avatar",
      };

      const finalImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 250, height: 250 } }],
        { compress: 0.75, format: SaveFormat.JPEG, base64: true }
      );

      const fileExt = photo.name.split(".").pop();
      const filePath = `${session?.user.id}/icon.jpg`;

      const { error } = await sb.storage
        .from("avatars")
        .upload(filePath, decode(finalImage.base64 as string), {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      setRandomId(randomUUID());

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
            source={{ uri: avatarUrl as string }}
            accessibilityLabel="Avatar"
            // placeholder={
            //   "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
            // }
            // onError={(e) => {
            //   setAvatarUrl(null);
            // }}
            style={[
              avatarSize,
              tw`rounded-full max-w-full mx-auto`,
              {
                objectFit: "cover",
              },
            ]}
            // contentFit="cover"
          />
        ) : (
          <View
            style={[
              avatarSize,
              tw`rounded-full max-w-full mx-auto bg-muted dark:bg-dark-muted border border-muted-foreground dark:border-dark-muted-foreground justify-center items-center`,
            ]}
          >
            <Text
              style={tw`text-muted-foreground dark:text-dark-muted-foreground`}
            >
              {t("settings:uploadAvatar")}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
