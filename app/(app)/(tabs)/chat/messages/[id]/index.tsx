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
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { id: chat_id } = useLocalSearchParams();
  const bottomSheetRef = React.useRef(null);
  // const snapPoints = React.useMemo(() => ["25%", "50%"], []);
  const [page, setPage] = useState(0);
  const [newIncomeMessages, setNewIncomeMessages] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetchMessages();
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, [chat_id]);

  const fetchMessages = async (offset = 0) => {
    const { data, error } = await sb
      .from("chat_messages")
      .select("*, user:users(id, name)")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }
    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }
    setMessages((prevMessages) => [...prevMessages, ...data]);
    setIsLoading(false);
    setIsLoadingMore(false);
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
        handleRealtimePayload
      )
      .subscribe();
  };

  const handleRealtimePayload = async (
    payload: RealtimePostgresChangesPayload<{
      [key: string]: any;
    }>
  ) => {
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
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
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
    if (!isLoadingMore) return null;
    return <ActivityIndicator style={{ margin: 20 }} />;
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-new-bg`}>
      {/* <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        style={tw`w-full`}
      >
        <View style={tw`flex-1 bg-new-bg`} />
      </BottomSheet> */}

      {!isLoading ? (
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
      ) : (
        <ContentLoader
          speed={2}
          width={400} // Adjust based on your container's width
          height={600} // Adjust based on how many items you want to show
          viewBox="0 0 400 600" // Adjust based on width and height
          backgroundColor={
            colorScheme === "dark"
              ? tw.color("dark-border")
              : tw.color("border")
          }
          foregroundColor={
            colorScheme === "dark"
              ? tw.color("dark-new-background")
              : tw.color("new-background")
          }
          opacity={0.3}
        >
          <Circle cx="30" cy="30" r="15" />
          <Rect x="50" y="15" rx="15" ry="15" width="220" height="60" />

          <Circle cx="30" cy="100" r="15" />
          <Rect x="50" y="85" rx="15" ry="15" width="170" height="30" />

          <Circle cx="30" cy="140" r="15" />
          <Rect x="50" y="125" rx="15" ry="15" width="220" height="60" />

          <Circle cx="30" cy="210" r="15" />
          <Rect x="50" y="195" rx="15" ry="15" width="170" height="30" />

          <Circle cx="30" cy="250" r="15" />
          <Rect x="50" y="235" rx="15" ry="15" width="220" height="60" />

          <Circle cx="30" cy="320" r="15" />
          <Rect x="50" y="305" rx="15" ry="15" width="170" height="30" />

          <Circle cx="30" cy="360" r="15" />
          <Rect x="50" y="345" rx="15" ry="15" width="220" height="60" />

          <Circle cx="30" cy="430" r="15" />
          <Rect x="50" y="415" rx="15" ry="15" width="170" height="30" />

          <Circle cx="30" cy="470" r="15" />
          <Rect x="50" y="455" rx="15" ry="15" width="220" height="60" />

          <Circle cx="30" cy="540" r="15" />
          <Rect x="50" y="525" rx="15" ry="15" width="170" height="30" />

          <Circle cx="30" cy="580" r="15" />
          <Rect x="50" y="565" rx="15" ry="15" width="220" height="60" />
        </ContentLoader>
      )}

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
