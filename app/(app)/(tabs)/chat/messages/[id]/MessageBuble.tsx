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
import { useSupabase } from "@/context/useSupabase";
import { Text } from "@/components/ui/Text";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import Hyperlink from "react-native-hyperlink";
import Avatar from "@/components/Avatar";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { SharedValue } from "react-native-reanimated";
// import { HoldItem } from "react-native-hold-menu";

const MessageBubble = ({
  message,
  isGroupStart,
  isGroupEnd,
  colorScheme,
}: {
  message: {
    text: string;
    user: {
      id: string;
      name: string;
    };
  };
  isGroupStart: boolean;
  isGroupEnd: boolean;
  colorScheme: string;
}) => {
  const { session } = useSupabase();
  const isCurrentUser = message.user.id === session?.user.id;

  const bubbleStyle = {
    ...(isCurrentUser ? tw`rounded-bl-lg` : tw`rounded-br-lg`),
    ...tw`px-4 py-2 flex-shrink-1 bg-white dark:bg-dark-new-background border border-border dark:border-dark-border`,
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
        style={{ width: 100, justifyContent: "center", alignItems: "center" }}
      >
        <RNText style={{ color: "#fff" }}>
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
        </RNText>
      </View>
    );
  };

  return (
    // <HoldItem
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
    //   menuAnchorPosition="bottom-center"
    // >
    <Swipeable renderRightActions={renderRightActions}>
      <View>
        {isGroupStart && !isCurrentUser && (
          <View style={tw`flex flex-row mt-2`}>
            <View style={tw`w-8 mr-2`} />
            <Text style={[usernameStyle, { color: textColor }]}>
              {message.user.name}
            </Text>
          </View>
        )}
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
                tw`flex-1 rounded-lg p-2 ${
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
                    tw`font-bold mt-0 pt-0 mb-1`,
                    { maxHeight: 40, overflow: "hidden" },
                  ]}
                >
                  {title}
                </Text>
              )}
              renderDescription={(description) => (
                <Text
                  style={[
                    { color: textColor },
                    tw`text-xs text-mt-fg max-h-12 overflow-hidden`,
                  ]}
                >
                  {description}
                </Text>
              )}
              renderImage={(image) => (
                <Image
                  source={{ uri: image.url }}
                  style={tw`w-full h-40 rounded-lg mb-0`}
                />
              )}
            />
          </View>
        )}
      </View>
    </Swipeable>
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
