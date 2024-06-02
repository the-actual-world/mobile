import tw from "@/lib/tailwind";
import { Image } from "expo-image";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import React from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ExternalLinkIcon, ScanEyeIcon } from "lucide-react-native";
import { getPostAttachmentSource } from "@/lib/utils";
import { useRouter } from "expo-router";

export default function PostImage({
  caption,
  path,
  post_id,
  media_type,
  user_id,
  showLightbox,
}: {
  caption: string;
  path: string;
  post_id: string;
  media_type: string;
  user_id: string;
  showLightbox: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        showLightbox();
      }}
      style={tw`mt-0`}
    >
      <Image
        source={{ uri: getPostAttachmentSource(path, user_id) }}
        style={[
          tw`w-full`,
          {
            resizeMode: "cover",
            aspectRatio: 1,
          },
        ]}
      />

      <View style={tw`absolute bottom-0.5 right-0.5 flex-row gap-0.5`}>
        {media_type === "image" && caption && (
          <TouchableOpacity
            style={tw`bg-dark-muted p-1 rounded-full`}
            onPress={() => {
              Alert.alert(t("common:caption"), caption);
            }}
          >
            <ScanEyeIcon size={12} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={tw`bg-dark-muted p-1 rounded-full`}
          onPress={() => {
            router.push(`/home/post/${post_id}`);
          }}
        >
          <ExternalLinkIcon size={12} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
