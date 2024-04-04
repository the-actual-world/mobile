import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text as RNText,
  Linking,
  TouchableOpacity,
} from "react-native";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Text } from "@/components/ui/Text";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import Hyperlink from "react-native-hyperlink";
import Avatar from "@/components/Avatar";
import { Swipeable } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
//@ts-ignore
import { HoldItem } from "react-native-hold-menu";
// import ContextMenu from "react-native-context-menu-view";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { useColorScheme } from "@/context/ColorSchemeProvider";

const MessageBubble = ({
  message,
  messageInformation,
}: {
  message: {
    id: string;
    text: string;
    image: string | null;
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
}) => {
  const { isGroupStart, isGroupEnd, isDayStart } = messageInformation;
  const { session } = useSupabase();
  const { colorScheme } = useColorScheme();
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
        {/* <RNText style={{ color: "#fff" }}>
          {["👍", "👎", "👏"].map((emoji, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={tw`justify-center items-center rounded-full w-8 h-8`}
              >
                <Text style={tw`text-xl`}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </RNText> */}

        {/* render time of message as hour:minute */}
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

  return (
    // <HoldItem
    //   styles={{
    //     position: "relative",
    //     maxWidth: "100%",
    //     backgroundColor: "red",
    //   }}
    //   items={[
    //     { text: "Actions", isTitle: true, onPress: () => {} },
    //     { text: "Reply", onPress: () => {} },
    //     { text: "Edit", onPress: () => {} },
    //     {
    //       text: "Delete",
    //       withSeparator: true,
    //       isDestructive: true,
    //       onPress: () => {},
    //     },
    //     { text: "Share", onPress: () => {} },
    //   ]}
    //   menuAnchorPosition="top-center"
    //   bottom
    // >
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
        <View style={tw`flex flex-row mt-2`}>
          <View style={tw`w-8 mr-2`} />
          <Text style={[usernameStyle, { color: textColor }]}>
            {message.user.name}
          </Text>
        </View>
      )}

      {urls?.length === 1 && (
        <View
          style={tw`flex flex-row w-full gap-2 ${
            isCurrentUser ? "justify-end" : ""
          }`}
        >
          {!isCurrentUser && <View style={tw`w-8`} />}
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
                  { color: textColor },
                  tw`font-bold m-0 p-0`,
                  { maxHeight: 44, overflow: "hidden" },
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
        </View>
      )}

      {message.image &&
        (!isCurrentUser || message.text !== "" ? (
          <View
            style={tw`flex flex-row w-full gap-2 ${
              isCurrentUser ? "justify-end" : ""
            }`}
          >
            {!isCurrentUser && <View style={tw`w-8`} />}
            <Image
              source={{
                uri: sb.storage
                  .from("chat_images")
                  .getPublicUrl(`${message.user.id}/${message.image}`).data
                  .publicUrl,
              }}
              // style={tw`w-40 rounded-lg mb-0`}
              style={{ width: 40 }}
              resizeMode="contain"
            />
          </View>
        ) : (
          <HoldItem
            key={message.id + "-image"}
            items={[
              {
                key: "delete-" + message.id + "-image",
                text: t("common:delete"),
                icon: "trash",
                isDestructive: true,
                onPress: deleteMessage,
              },
            ]}
          >
            <View
              style={tw`flex flex-row w-full gap-2 ${
                isCurrentUser ? "justify-end" : ""
              }`}
            >
              {!isCurrentUser && <View style={tw`w-8`} />}
              <Image
                source={{
                  uri: sb.storage
                    .from("chat_images")
                    .getPublicUrl(`${message.user.id}/${message.image}`).data
                    .publicUrl,
                }}
                style={tw`w-30 h-30 rounded-lg mb-0`}
              />
            </View>
          </HoldItem>
        ))}

      {message.text !== "" && (
        <HoldItem
          key={message.id}
          items={
            isCurrentUser
              ? [
                  { text: t("common:actions"), icon: "home", isTitle: true },
                  {
                    key: "copy-" + message.id,
                    text: t("common:copy"),
                    icon: "copy",
                    onPress: copyToClipboard,
                  },
                  {
                    key: "delete-" + message.id,
                    text: t("common:delete"),
                    icon: "trash",
                    isDestructive: true,
                    onPress: deleteMessage,
                  },
                ]
              : [
                  { text: t("common:actions"), icon: "home", isTitle: true },
                  {
                    key: "copy-" + message.id,
                    text: t("common:copy"),
                    icon: "copy",
                    onPress: copyToClipboard,
                  },
                ]
          }
        >
          <Swipeable renderRightActions={renderRightActions}>
            <View
              style={[
                tw`flex-row`,
                isCurrentUser ? tw`justify-end` : tw`justify-start`,
              ]}
            >
              {!isCurrentUser && isGroupStart ? (
                <View style={tw`mr-2`}>
                  <Avatar userId={message.user.id} size={32} />
                </View>
              ) : (
                <View style={tw`w-8 h-8 mr-2`} />
              )}
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
          </Swipeable>
        </HoldItem>
      )}
    </View>
    // </HoldItem>
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

export default MessageBubble;
