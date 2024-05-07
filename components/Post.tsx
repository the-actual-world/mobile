import { Dimensions, View } from "react-native";
import { Text } from "./ui/Text";
import Avatar from "./Avatar";
import React from "react";
import { Database } from "@/supabase/functions/_shared/supabase";
import { Image } from "expo-image";
import tw from "@/lib/tailwind";
import { LocationUtils, getPostAttachmentSource } from "@/lib/utils";
import Carousel from "react-native-reanimated-carousel";
import Gallery from "react-native-awesome-gallery";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import ImageView from "react-native-image-viewing";
import { fonts } from "@/lib/styles";

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

  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();

  const attachmentList: {
    uri: string;
  }[] = attachments.map((attachment) => ({
    uri: getPostAttachmentSource(attachment.path, author.id),
  }));

  const [locationName, setLocationName] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function getLocationName() {
      if (location) {
        setLocationName(
          await LocationUtils.getLocationName(location, i18n.language)
        );
      }
    }
    getLocationName();
  }, [location]);

  React.useEffect(() => {
    console.log(attachmentIndex);
  }, [attachmentIndex]);

  return (
    <>
      <ImageView
        images={attachmentList || []}
        imageIndex={attachmentIndex || 0}
        visible={attachmentIndex !== null}
        onRequestClose={() => setAttachmentIndex(null)}
        swipeToCloseEnabled={false}
        presentationStyle="overFullScreen"
      />
      <View style={tw`px-4 gap-2`}>
        <View style={tw`flex-row items-center`}>
          <Avatar userId={author.id} size={40} />
          <View style={tw`ml-2 gap-1`}>
            <Text
              style={{
                fontFamily: fonts.inter.semiBold,
              }}
            >
              {author.name}
            </Text>
            {location && (
              <Text style={tw`text-xs text-mt-fg`}>
                {locationName || `${location.latitude},${location.longitude}`}
              </Text>
            )}
          </View>
          <Text style={tw`ml-auto text-xs text-mt-fg`}>
            {updated_at.toLocaleString()}
          </Text>
        </View>
        <Text>{text}</Text>
      </View>
      {attachments.length > 1 ? (
        <Carousel
          loop={false}
          width={width}
          height={400}
          data={attachments.map((attachment) => ({
            uri: getPostAttachmentSource(attachment.path, author.id),
          }))}
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
          style={tw`-mb-5 -mt-1`}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
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
      ) : attachments.length === 1 ? (
        <TouchableWithoutFeedback
          onPress={() => {
            setAttachmentIndex(0);
          }}
          style={tw`mt-4 -mb-5`}
        >
          <Image
            source={{ uri: attachmentList[0].uri }}
            style={[
              tw`w-full`,
              {
                resizeMode: "cover",
                height: 400,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      ) : null}
    </>
  );
}
