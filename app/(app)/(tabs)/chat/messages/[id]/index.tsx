import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView, View, TextInput, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import tw from "@/lib/tailwind";
import { useTranslation } from "react-i18next";
import { PaperclipIcon, SendIcon } from "lucide-react-native";
import { useSupabase } from "@/context/useSupabase";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import MessageBubble from "./MessageBuble";
import { Input } from "@/components/ui/Input";
import { useLocalSearchParams } from "expo-router";

const Messages = () => {
  const [messages, setMessages] = useState<
    {
      id: string;
      text: string;
      createdAt: Date;
      user: { id: number; name: string; avatar: string };
    }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { session, sb } = useSupabase();
  const [loading, setLoading] = useState(false);

  const { id: chat_id } = useLocalSearchParams<{
    id: string;
  }>();

  useEffect(() => {
    setLoading(true);
    const fetchMessages = async () => {
      const { data, error } = await sb
        .from("chat_messages")
        .select("*, user:users(id, name)")
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error(error);
        return;
      }
      setMessages(data as any);
      setLoading(false);
    };
    fetchMessages();

    const subscription = sb
      .channel(`message-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chat_id}`,
        },
        async (payload) => {
          console.log("PAYLOAD", payload);
          if (payload.eventType === "INSERT") {
            const user = await sb
              .from("users")
              .select("*")
              .eq("id", payload.new.sender_id);
            console.log("USER", user);
            console.log("PAYLOAD", payload);
            setMessages((previousMessages) => [
              {
                id: payload.new.id,
                text: payload.new.text,
                createdAt: payload.new.created_at,
                user: user.data[0],
              },
              ...previousMessages,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const user = await sb
              .from("users")
              .select("*")
              .eq("id", payload.new.sender_id);
            setMessages((previousMessages) =>
              previousMessages.map((message) =>
                message.id === payload.new.id
                  ? {
                      ...message,
                      text: payload.new.text,
                      user: user.data[0],
                    }
                  : message
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((previousMessages) =>
              previousMessages.filter(
                (message) => message.id !== payload.old.id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      const newMsg = {
        text: newMessage,
        chat_id: chat_id,
      };
      await sb.from("chat_messages").insert(newMsg);
      // setMessages((previousMessages) => [newMsg, ...previousMessages]);
      setNewMessage("");
    }
  }, [newMessage, session?.user.id]);

  const isGroupStart = (id: string) => {
    const lastMessage = messages.find((message) => message.id === id);
    const index = messages.indexOf(lastMessage);
    const previousMessage = messages[index + 1];
    if (previousMessage) {
      return lastMessage?.user.id !== previousMessage.user.id;
    }
    return true;
  };

  const isGroupEnd = (id: string) => {
    const lastMessage = messages.find((message) => message.id === id);
    const index = messages.indexOf(lastMessage);
    const nextMessage = messages[index - 1];
    if (nextMessage) {
      return lastMessage?.user.id !== nextMessage.user.id;
    }
    return true;
  };

  const renderMessageItem = useCallback(
    ({
      item,
      index,
    }: {
      item: {
        id: string;
        text: string;
        createdAt: Date;
        user: { id: number; name: string; avatar: string };
      };
      index: number;
    }) => (
      <MessageBubble
        message={item}
        isGroupStart={isGroupStart(item.id)}
        isGroupEnd={isGroupEnd(item.id)}
        colorScheme={colorScheme as string}
      />
    ),
    [messages, colorScheme]
  );

  const renderRightActions = (progress, dragX) => {
    // You can use the progress and dragX to animate the appearance of the timestamp
    // For a simple implementation, we'll just return a view with the timestamp
    return (
      <View
        style={{ width: 100, justifyContent: "center", alignItems: "center" }}
      >
        <RNText style={{ color: "#fff" }}>{message.sentAt}</RNText>{" "}
        {/* Adjust 'message.sentAt' based on your message object */}
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-new-bg`}>
      <FlashList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        inverted
        estimatedItemSize={70}
        contentContainerStyle={tw`pb-7 pr-4`}
      />
      <View style={tw`flex-row items-center p-4 gap-2`}>
        <TouchableOpacity
          style={tw`justify-center items-center dark:bg-accent rounded-full w-8 h-8`}
        >
          <PaperclipIcon
            size={22}
            color={
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("accent")
            }
          />
        </TouchableOpacity>
        <Input
          style={tw`flex-1`}
          placeholder={t("chat:placeholder")}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={tw`justify-center items-center dark:bg-accent rounded-full w-8 h-8`}
        >
          <SendIcon
            size={22}
            color={
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("accent")
            }
            style={tw`mt-1 mr-1`}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Messages;
