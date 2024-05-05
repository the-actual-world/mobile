import { Dimensions, View } from "react-native";
import { Text } from "./ui/Text";
import Avatar from "./Avatar";
import React from "react";
import { Database } from "@/supabase/functions/_shared/supabase";
import { Image } from "expo-image";
import tw from "@/lib/tailwind";
import { getPostAttachmentSource } from "@/lib/utils";
import Carousel from "react-native-reanimated-carousel";
import Gallery from "react-native-awesome-gallery";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export type PostProps = {
  id: string;
  author: {
    id: string;
    name: string;
  };
  text: string;
  attachments: {
    caption: string;
    path: string;
    media_type: Database["public"]["Enums"]["mediatype"];
  }[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
  updated_at: Date;
  created_at: Date;
};

export function Post({
  id,
  author,
  text,
  attachments,
  location,
  updated_at,
  created_at,
}: PostProps) {
  const width = Dimensions.get("window").width;
  const [attachmentIndex, setAttachmentIndex] = React.useState<number | null>(
    null
  );

  const attachmentList = attachments.map((attachment) =>
    getPostAttachmentSource(attachment.path, author.id)
  );

  return (
    <>
      {attachmentIndex && (
        <Gallery
          data={attachmentList}
          initialIndex={attachmentIndex}
          onSwipeToClose={() => {
            setAttachmentIndex(null);
          }}
          onIndexChange={(index) => setAttachmentIndex(index)}
          style={tw`w-full h-full`}
        />
      )}
      <View style={tw`bg-mt rounded-lg p-4 mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Avatar userId={author.id} size={40} />
          <Text style={tw`ml-2 font-bold`}>{author.name}</Text>
          <Text style={tw`ml-auto text-xs text-mt-fg`}>
            {updated_at.toLocaleString()}
          </Text>
        </View>
        <Text style={tw`mt-2`}>{text}</Text>
      </View>
      <Carousel
        loop={false}
        width={width}
        height={400}
        data={attachments.map((attachment) => ({
          uri: getPostAttachmentSource(attachment.path, author.id),
        }))}
        onSnapToItem={(index) => console.log("current index:", index)}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        renderItem={({ item, index }) => (
          <TouchableWithoutFeedback
            onPress={() => {
              setAttachmentIndex(index);
            }}
          >
            <Image
              source={{ uri: item.uri }}
              style={[
                tw`w-full`,
                {
                  resizeMode: "cover",
                  borderRadius: 10,
                  height: 400,
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}
      />
    </>
  );
}
