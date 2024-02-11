import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import tw from "@/lib/tailwind";
import { useTranslation } from "react-i18next";
import { PaperclipIcon, SendIcon } from "lucide-react-native";
import { useSupabase } from "@/context/useSupabase";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import MessageBubble from "./MessageBuble";
import { Input } from "@/components/ui/Input";
import { useLocalSearchParams } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";

const PAGE_SIZE = 15;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { id: chat_id } = useLocalSearchParams();
  const bottomSheetRef = React.useRef(null);
  const snapPoints = React.useMemo(() => ["25%", "50%"], []);
  const [page, setPage] = useState(0);
  const [newIncomeMessages, setNewIncomeMessages] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, [chat_id]);

  // useEffect(() => {
  //   setLoading(true);
  //   const fetchMessages = async () => {
  //     const { data, error } = await sb
  //       .from("chat_messages")
  //       .select("*, user:users(id, name)")
  //       .eq("chat_id", chat_id)
  //       .order("created_at", { ascending: false })
  //       .limit(100);
  //     if (error) {
  //       console.error(error);
  //       return;
  //     }
  //     setMessages(data as any);
  //     setLoading(false);
  //   };
  //   fetchMessages();

  //   const subscription = sb
  //     .channel(`message-changes`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "chat_messages",
  //         filter: `chat_id=eq.${chat_id}`,
  //       },
  //       async (payload) => {
  //         if (payload.eventType === "INSERT") {
  //           const user = await sb
  //             .from("users")
  //             .select("*")
  //             .eq("id", payload.new.sender_id);
  //           console.log("USER", user);
  //           console.log("PAYLOAD", payload);
  //           setMessages((previousMessages) => [
  //             {
  //               id: payload.new.id,
  //               text: payload.new.text,
  //               createdAt: payload.new.created_at,
  //               user: user.data[0],
  //             },
  //             ...previousMessages,
  //           ]);
  //         } else if (payload.eventType === "UPDATE") {
  //           const user = await sb
  //             .from("users")
  //             .select("*")
  //             .eq("id", payload.new.sender_id);
  //           setMessages((previousMessages) =>
  //             previousMessages.map((message) =>
  //               message.id === payload.new.id
  //                 ? {
  //                     ...message,
  //                     text: payload.new.text,
  //                     user: user.data[0],
  //                   }
  //                 : message
  //             )
  //           );
  //         } else if (payload.eventType === "DELETE") {
  //           setMessages((previousMessages) =>
  //             previousMessages.filter(
  //               (message) => message.id !== payload.old.id
  //             )
  //           );
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  const fetchMessages = async (offset = 0) => {
    const { data, error } = await sb
      .from("chat_messages")
      .select("*, user:users(id, name)")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }
    setMessages((prevMessages) => [...prevMessages, ...data]);
    setLoading(false);
    setLoadingMore(false);
  };

  const setupRealtimeUpdates = () => {
    return sb
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
          handleRealtimePayload(payload);
        }
      )
      .subscribe();
  };

  const handleRealtimePayload = async (payload) => {
    if (payload.eventType === "INSERT") {
      const user = await sb
        .from("users")
        .select("*")
        .eq("id", payload.new.sender_id);
      setMessages((previousMessages) => [
        {
          id: payload.new.id,
          text: payload.new.text,
          createdAt: payload.new.created_at,
          user: user.data[0],
        },
        ...previousMessages,
      ]);
      setNewIncomeMessages((prev) => prev + 1);
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
        previousMessages.filter((message) => message.id !== payload.old.id)
      );
      setNewIncomeMessages((prev) => prev - 1);
    }
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const newOffset = page + 1;
      fetchMessages(newOffset * PAGE_SIZE + newIncomeMessages);
      setPage(newOffset);
    }
    console.log("End reached! Loading " + page * PAGE_SIZE + " more messages");
  };

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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator style={{ margin: 20 }} />;
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-new-bg`}>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        style={tw`w-full`}
      >
        <View style={tw`flex-1 bg-new-bg`} />
      </BottomSheet>

      <FlashList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        inverted
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
