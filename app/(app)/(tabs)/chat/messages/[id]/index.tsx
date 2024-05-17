import React, { useState, useCallback, useEffect } from "react";
import Gallery from "react-native-awesome-gallery";
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { FlashList } from "@shopify/flash-list";
import tw from "@/lib/tailwind";
import { useTranslation } from "react-i18next";
import {
  CameraIcon,
  PaperclipIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react-native";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import MessageBubble from "./MessageBuble";
import { Input } from "@/components/ui/Input";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { Tables } from "@/supabase/functions/_shared/supabase";
import * as ImagePicker from "expo-image-picker";
import { Text } from "@/components/ui/Text";
import { decode } from "base64-arraybuffer";
import ImageView from "react-native-image-viewing";

const PAGE_SIZE = 15;

const Messages = () => {
  const [messages, setMessages] = useState<
    {
      id: string;
      text: string;
      createdAt: Date;
      user: { id: string; name: string; created_at: Date };
    }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { id: chat_id } = useLocalSearchParams();
  type ChatData = Tables<"chats"> & {
    participants: Tables<"chat_participants"> &
      {
        user: Tables<"users">;
      }[];
  };
  const [chatData, setChatData] = useState<ChatData | null>();
  // const snapPoints = React.useMemo(() => ["25%", "50%"], []);
  const [page, setPage] = useState(0);
  const [newIncomeMessages, setNewIncomeMessages] = useState(0);

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["30%"], []);
  const handlePresentEmbedImageModal = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const router = useRouter();

  const [currentEmbeddedImage, setCurrentEmbeddedImage] = useState<
    string | null
  >(null);

  const [imageBeingViewed, setImageBeingViewed] = useState<string | null>(null);

  async function updateLastReadAt() {
    await sb
      .from("chat_participants")
      .update({
        last_read_at: new Date().toISOString(),
      })
      .eq("chat_id", chat_id as string)
      .eq("user_id", session?.user.id as string);
  }

  async function storeImage(file: ImagePicker.ImagePickerResult) {
    if (file.assets && file.assets.length > 0) {
      const asset = file.assets[0];

      const fileExt = asset.uri.split(".").pop();
      console.log("Just here");
      const filePath = `${new Date().getTime()}.${fileExt}`;
      const contentType =
        (asset.type === "image" ? "image/" : "video/") + fileExt;
      const fullFilePath = `${session?.user.id}/${filePath}`;
      const { data, error } = await sb.storage
        .from("chat_images")
        .upload(fullFilePath, decode(asset.base64 as string), {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });
      if (error) {
        console.error(error);
        return;
      }
      setCurrentEmbeddedImage(filePath);
      return fullFilePath;
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchDataAndMessages();
    updateLastReadAt();
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, [chat_id]);

  const fetchDataAndMessages = async (offset = 0) => {
    const { data: chatData_, error: chatError } = await sb
      .from("chats")
      .select("*, participants:chat_participants(*, user:users(id, name))")
      .eq("id", chat_id as string);
    if (chatError) {
      console.error(chatError);
      setIsLoading(false);
      return;
    }
    setChatData(chatData_[0]);

    const { data, error } = await sb
      .from("chat_messages")
      .select("*, user:users(id, name)")
      .eq("chat_id", chat_id as string)
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
    const formattedData = data.map((item) => ({
      ...item,
      createdAt: new Date(item.created_at),
      user: item.user ?? { id: "", name: "", created_at: new Date() },
    }));
    setMessages((prevMessages) => [...prevMessages, ...formattedData]);
    setIsLoading(false);
  };

  const deleteCurrentEmbeddedImage = async () => {
    if (currentEmbeddedImage) {
      await sb.storage
        .from("chat_images")
        .remove([`${session?.user.id}/${currentEmbeddedImage}`]);
      setCurrentEmbeddedImage(null);
    }
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
      if (user.error) {
        console.error(user.error);
        return;
      }
      updateLastReadAt();
      setMessages((previousMessages) => [
        {
          id: payload.new.id,
          text: payload.new.text,
          image: payload.new.image,
          createdAt: new Date(payload.new.created_at),
          user: {
            id: user.data[0].id,
            name: user.data[0].name ?? "",
            created_at: user.data[0].created_at
              ? new Date(user.data[0].created_at)
              : new Date(),
          },
        },
        ...previousMessages,
      ]);
      setNewIncomeMessages((prev) => prev + 1);
    } else if (payload.eventType === "UPDATE") {
      const user = await sb
        .from("users")
        .select("*")
        .eq("id", payload.new.sender_id);
      if (user.error) {
        console.error(user.error);
        return;
      }
      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.id === payload.new.id
            ? {
                ...message,
                text: payload.new.text,
                image: payload.new.image,
                user: {
                  ...message.user,
                  name: user.data[0].name ?? "",
                },
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
      fetchDataAndMessages(newOffset * PAGE_SIZE + newIncomeMessages);
      setPage(newOffset);
      setIsLoadingMore(false);
    }
    console.log("End reached! Loading " + page * PAGE_SIZE + " more messages");
  };

  const sendMessage = useCallback(async () => {
    if (newMessage.trim() || currentEmbeddedImage) {
      const newMsg = {
        text: newMessage,
        image: currentEmbeddedImage,
        chat_id: chat_id?.toString() || "",
      };
      await sb.from("chat_messages").insert(newMsg);
      // setMessages((previousMessages) => [newMsg, ...previousMessages]);
      setNewMessage("");
      setCurrentEmbeddedImage(null);
    }
    updateLastReadAt();
  }, [newMessage, currentEmbeddedImage, session?.user.id]);

  const getMessageInformation = (id: string) => {
    const lastMessage = messages.find((message) => message.id === id);
    let isGroupStart = false;
    let isGroupEnd = false;
    let isDayStart = false;
    if (!lastMessage) return { isGroupStart, isGroupEnd, isDayStart };
    const index = messages.indexOf(lastMessage);
    const previousMessage = messages[index + 1];
    const nextMessage = messages[index - 1];
    if (previousMessage) {
      isGroupStart = lastMessage.user.id !== previousMessage.user.id;
    } else {
      isGroupStart = true;
    }
    if (nextMessage) {
      isGroupEnd = lastMessage.user.id !== nextMessage.user.id;
    } else {
      isGroupEnd = true;
    }
    if (previousMessage) {
      isDayStart =
        lastMessage.createdAt.getDate() !== previousMessage.createdAt.getDate();
    } else {
      isDayStart = true;
    }
    return { isGroupStart, isGroupEnd, isDayStart };
  };

  const renderMessageItem = useCallback(
    ({
      item,
      index,
    }: {
      item: {
        id: string;
        text: string;
        image: string | null;
        createdAt: Date;
        user: { id: string; name: string; created_at: Date };
      };
      index: number;
    }) => (
      <MessageBubble
        message={item}
        messageInformation={getMessageInformation(item.id)}
        setImageBeingViewed={setImageBeingViewed}
      />
    ),
    [messages]
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <ActivityIndicator style={{ margin: 20 }} />;
  };

  if (!chatData) {
    return (
      <View style={tw`flex-1 bg-new-background dark:bg-dark-new-background`} />
    );
  }

  return (
    <>
      <ImageView
        images={[{ uri: imageBeingViewed as string }]}
        presentationStyle="overFullScreen"
        imageIndex={0}
        visible={!!imageBeingViewed}
        onRequestClose={() => setImageBeingViewed(null)}
        swipeToCloseEnabled={false}
      />
      <SafeAreaView
        key={tw.memoBuster}
        style={[tw`bg-new-background dark:bg-dark-new-background flex-1`]}
      >
        <Stack.Screen
          key={tw.memoBuster}
          options={{
            headerShown: true,
            // set current screen title to group name or user name if it's a direct message
            headerTitle:
              (chatData.chat_type === "group"
                ? chatData.name
                : chatData.participants.find(
                    (participant) => participant.user.id !== session?.user.id
                  )?.user.name) || "",
          }}
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          enableContentPanningGesture={false}
          backgroundStyle={tw`bg-new-bg border-t border-bd`}
          handleIndicatorStyle={tw`bg-mt-fg`}
          style={tw`px-6 py-4`}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              opacity={0.5}
              enableTouchThrough={false}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              style={[
                { backgroundColor: "rgba(0, 0, 0, 1)" },
                StyleSheet.absoluteFillObject,
              ]}
            />
          )}
        >
          <View style={tw`flex-row gap-4 h-full my-2 pb-12`}>
            <TouchableOpacity
              style={tw`flex-1 justify-center items-center bg-accent rounded-md py-4`}
              onPress={async () => {
                const { status } =
                  await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.75,
                  base64: true,
                });
                if (result.canceled) return;

                const image_path = await storeImage(result);
                if (image_path) {
                  bottomSheetModalRef.current?.dismiss();
                }
              }}
            >
              <CameraIcon
                size={32}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-background")
                    : tw.color("background")
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 justify-center items-center bg-accent rounded-md py-4`}
              onPress={async () => {
                const { status } =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.75,
                  base64: true,
                });
                if (result.canceled) return;

                const image_path = await storeImage(result);
                if (image_path) {
                  bottomSheetModalRef.current?.dismiss();
                }
              }}
            >
              <PaperclipIcon
                size={32}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-background")
                    : tw.color("background")
                }
              />
            </TouchableOpacity>
          </View>
        </BottomSheetModal>

        {!isLoading ? (
          <FlashList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item: any) => item.id}
            inverted
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            estimatedItemSize={60}
            contentContainerStyle={tw`pb-5 pr-4 pl-2`}
          />
        ) : (
          <View
            style={tw`flex-1 bg-new-background dark:bg-dark-new-background`}
          >
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
          </View>
        )}

        <View>
          {currentEmbeddedImage && (
            <View style={tw`relative h-40 w-40 ml-4 mt-4`}>
              <Image
                source={{
                  uri: sb.storage
                    .from("chat_images")
                    .getPublicUrl(`${session?.user.id}/${currentEmbeddedImage}`)
                    .data.publicUrl,
                }}
                style={[tw`w-full h-full rounded-lg h-40 w-40`]}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={deleteCurrentEmbeddedImage}
                style={tw`absolute top-2 right-2`}
              >
                <Text style={tw`text-accent`}>
                  <TrashIcon
                    size={16}
                    color={tw.color("destructive")}
                    strokeWidth={2.5}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={tw`flex-row items-center p-4 gap-2`}>
            <TouchableOpacity
              style={tw`justify-center items-center dark:bg-accent rounded-full w-8 h-8`}
              onPress={handlePresentEmbedImageModal}
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
        </View>
      </SafeAreaView>
    </>
  );
};

export default Messages;
