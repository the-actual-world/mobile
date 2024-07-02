import React from "react";
import {
  View,
  StyleSheet,
  Text as RNText,
  Linking,
  TouchableOpacity,
  Alert,
} from "react-native";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Text } from "@/components/ui/Text";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import Hyperlink from "react-native-hyperlink";
import Avatar from "@/components/Avatar";
import { Swipeable } from "react-native-gesture-handler";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { Image } from "expo-image";
import { useSettings } from "@/context/SettingsProvider";
import { fonts } from "@/lib/styles";
import { showActionSheet } from "@/lib/utils";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ReplyIcon } from "lucide-react-native";

const MessageBubble = ({
  message,
  messageInformation,
  setImageBeingViewed,
  onStartReply,
}: {
  message: {
    id: string;
    text: string;
    image: string | null;
    reply_to: {
      id: string;
      text: string;
      user: { id: string; name: string };
    } | null;
    user: {
      id: string;
      name: string;
    };
    createdAt: Date;
  };
  messageInformation: {
    isGroupStart: boolean;
    isGroupEnd: boolean;
    isDayStart: boolean;
  };
  setImageBeingViewed: (image: string) => void;
  onStartReply: (
    id: string,
    text: string,
    user: { id: string; name: string }
  ) => void;
}) => {
  const { isGroupStart, isGroupEnd, isDayStart } = messageInformation;
  const { session } = useSupabase();
  const { colorScheme } = useColorScheme();
  const { settings } = useSettings();
  const isCurrentUser = message.user.id === session?.user.id;

  const { t } = useTranslation();

  const bubbleStyle = {
    ...(isCurrentUser ? tw`rounded-bl-lg` : tw`rounded-br-lg`),
    ...tw`px-4 py-2 flex-shrink-1 bg-white dark:bg-dark-new-background border border-bd`,
    backgroundColor: isCurrentUser
      ? colorScheme === "dark"
        ? tw.color("dark-border")
        : tw.color("border")
      : colorScheme === "dark"
      ? tw.color("dark-new-background")
      : tw.color("new-background"),
    borderTopLeftRadius: isGroupStart ? 16 : 4,
    borderTopRightRadius: isGroupStart ? 16 : 4,
    borderBottomLeftRadius: isGroupEnd ? 16 : 4,
    borderBottomRightRadius: isGroupEnd ? 16 : 4,
  };

  const textStyle = tw`text-sm`;
  const usernameStyle = tw`text-xs`;
  const textColor =
    colorScheme === "dark"
      ? tw.color("dark-muted-foreground")
      : tw.color("muted-foreground");

  const urls = message.text.match(
    /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g
  );

  const renderRightActions = (progress: any, dragX: any) => {
    return (
      <View
        style={{
          width: 53,
          justifyContent: "center",
          alignItems: "flex-end",
          marginRight: 5,
        }}
      >
        <Text style={tw`text-muted-foreground dark:text-dark-muted-foreground`}>
          {message.createdAt.toTimeString().split(" ")[0].substring(0, 5)}
        </Text>
      </View>
    );
  };

  async function copyToClipboard() {
    await Clipboard.setStringAsync(message.text);
  }

  async function deleteMessage() {
    await sb.from("chat_messages").delete().eq("id", message.id);
    if (message.image) {
      await sb.storage
        .from("chat_images")
        .remove([`${message.user.id}/${message.image}`]);
    }
  }

  const { showActionSheetWithOptions } = useActionSheet();

  const showMyActionSheet = () => {
    const options = [
      t("common:copy-text"),
      isCurrentUser ? t("common:delete") : null,
      t("common:cancel"),
    ].filter(Boolean);

    showActionSheet(
      { showActionSheetWithOptions, colorScheme },
      {
        options,
        destructiveButtonIndex: isCurrentUser ? 1 : undefined,
        cancelButtonIndex: options.length - 1,
      },
      (index) => {
        if (options[index] === t("common:copy")) {
          copyToClipboard();
        } else if (options[index] === t("common:delete")) {
          deleteMessage();
        }
      }
    );
  };

  return (
    <View key={message.id}>
      {isDayStart && (
        <View style={tw`flex flex-row justify-center items-center my-2`}>
          <View style={tw`bg-bd w-24 h-[0.37]`} />
          <Text
            style={tw`text-sm mx-2 text-muted-foreground dark:text-dark-muted-foreground`}
          >
            {message.createdAt.toLocaleDateString()} {t("common:at")}{" "}
            {message.createdAt.toTimeString().split(" ")[0].substring(0, 5)}
          </Text>
          <View style={tw`bg-bd w-24 h-[0.37]`} />
        </View>
      )}
      {isGroupStart && !isCurrentUser && (
        <View style={tw`flex flex-row mt-2 -mb-2.5`}>
          <Avatar userId={message.user.id} size={32} />
          <View style={tw`ml-2`}>
            <Text style={[usernameStyle, { color: textColor }]}>
              {message.user.name}
            </Text>
          </View>
        </View>
      )}

      {message.reply_to && (
        <View
          style={tw`flex flex-row w-full gap-2 ${
            isCurrentUser ? "justify-end" : ""
          }`}
        >
          {!isCurrentUser && <View style={tw`w-8`} />}
          <View
            style={[
              styles.bubble,
              tw`border-bd dark:border-dark-border rounded-lg`,
            ]}
          >
            <View style={tw`flex flex-row gap-1`}>
              <Text
                style={[
                  {
                    fontFamily: fonts.inter.medium,
                  },
                  tw`text-xs`,
                ]}
              >
                {t("chat:replyingTo")}
              </Text>
              <Text
                style={[
                  {
                    fontFamily: fonts.inter.bold,
                  },
                  tw`text-xs`,
                ]}
              >
                {message.reply_to.user.name}
              </Text>
            </View>
            <Text style={[tw`text-foreground dark:text-dark-foreground`]}>
              {message.reply_to.text}
            </Text>
          </View>
        </View>
      )}

      {urls?.length === 1 && (
        <View
          style={tw`flex flex-row w-full gap-2 ${
            isCurrentUser ? "justify-end" : ""
          }`}
        >
          {!isCurrentUser && <View style={tw`w-8`} />}
          {settings.others.previewLinks && (
            <LinkPreview
              text={urls[0]}
              renderHeader={() => null}
              renderText={() => null}
              metadataContainerStyle={tw`m-0 px-2`}
              metadataTextContainerStyle={tw`flex-1 p-0 m-0 mb-3`}
              containerStyle={[
                tw`flex flex-row flex-1 rounded-lg p-2 ${
                  isCurrentUser ? "bg-bd" : "border-bd"
                }`,
                { maxWidth: "80%" },
              ]}
              textContainerStyle={tw`flex-1 p-0 m-0`}
              enableAnimation
              renderMinimizedImage={() => null}
              renderTitle={(title) => (
                <Text
                  style={[
                    textStyle,
                    {
                      color: textColor,
                      fontFamily: fonts.inter.bold,
                      maxHeight: 44,
                      overflow: "hidden",
                    },
                    tw`m-0 p-0`,
                  ]}
                >
                  {title}
                </Text>
              )}
              renderDescription={(description) => (
                <Text
                  style={[
                    { color: textColor },
                    tw`text-xs text-muted-foreground dark:text-dark-muted-foreground max-h-12 overflow-hidden`,
                  ]}
                >
                  {description}
                </Text>
              )}
              renderImage={(image) => (
                <View style={tw`flex flex-row`}>
                  <Image
                    source={{ uri: image.url }}
                    style={tw`w-20 rounded-lg mb-0`}
                  />
                </View>
              )}
            />
          )}
        </View>
      )}

      <Swipeable
        renderRightActions={renderRightActions}
        // swipe left to reply to message
        renderLeftActions={(progress, dragX) => {
          return (
            <View
              style={tw`flex flex-row justify-center items-center`}
              key="left"
            >
              <ReplyIcon
                size={24}
                style={tw`text-muted-foreground dark:text-dark-muted-foreground`}
              />
            </View>
          );
        }}
        onSwipeableOpen={(direction, swipeable) => {
          if (direction === "left") {
            onStartReply(message.id, message.text, message.user);
            swipeable.close();
          }
        }}
      >
        <TouchableOpacity onLongPress={showMyActionSheet}>
          {message.image && (
            <View
              style={tw`flex flex-row w-full gap-2 ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isCurrentUser && <View style={tw`w-8`} />}
              <TouchableOpacity
                onPress={() => {
                  setImageBeingViewed(
                    sb.storage
                      .from("chat_images")
                      .getPublicUrl(`${message.user.id}/${message.image}`).data
                      .publicUrl
                  );
                }}
              >
                <Image
                  source={{
                    uri: sb.storage
                      .from("chat_images")
                      .getPublicUrl(`${message.user.id}/${message.image}`).data
                      .publicUrl,
                  }}
                  style={tw`h-50 w-50 rounded-lg ${
                    isGroupStart && isCurrentUser ? "mt-3" : ""
                  }`}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </View>
          )}

          {message.text !== "" && (
            <View
              style={[
                tw`flex-row`,
                isCurrentUser ? tw`justify-end` : tw`justify-start`,
              ]}
            >
              {!isCurrentUser && <View style={tw`w-8 mr-2`} />}
              <View style={[styles.bubble, bubbleStyle]}>
                <Hyperlink
                  onPress={(url) => {
                    Linking.openURL(url);
                  }}
                  linkStyle={{
                    color: colorScheme
                      ? tw.color("accent")
                      : tw.color("dark-accent"),
                  }}
                >
                  <Text
                    style={[
                      textStyle,
                      tw`text-foreground dark:text-dark-foreground`,
                    ]}
                  >
                    {message.text}
                  </Text>
                </Hyperlink>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tw.color("border"),
    flexShrink: 1,
    maxWidth: "80%",
  },
});

export default React.memo(MessageBubble);
