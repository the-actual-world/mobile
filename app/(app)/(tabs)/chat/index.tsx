import React, { useCallback, useEffect, useRef } from "react";
import { Link, useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { Text } from "@/components/ui/Text";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { getOtherChatUsers, showActionSheet } from "@/lib/utils";
import tw from "@/lib/tailwind";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "@/components/Avatar";
import { FloatingAction } from "react-native-floating-action";
import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";
import {
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react-native";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { Chat } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { fonts, styles } from "@/lib/styles";
import { Input } from "@/components/ui/Input";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { Tables } from "@/supabase/functions/_shared/supabase";
import Checkbox from "expo-checkbox";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useActionSheet } from "@expo/react-native-action-sheet";
import ListEmptyText from "@/components/ListEmptyText";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";

const ChatIndex = () => {
  const { session } = useSupabase();
  const { colorScheme } = useColorScheme();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(true);
  const router = useRouter();
  const [currentChatParticipantStatus, setCurrentChatParticipantStatus] =
    React.useState<"invited" | "joined" | "hidden">("joined");
  const [newChatName, setNewChatName] = React.useState("");
  const [newChatType, setNewChatType] = React.useState<"1-1" | "group">(
    "group"
  );
  const [newChatParticipants, setNewChatParticipants] = React.useState<
    string[]
  >([]);
  const [currentUserFriends, setCurrentUserFriends] = React.useState<
    Tables<"users">[]
  >([]);
  const [friendsWith1on1Chats, setFriendsWith1on1Chats] = React.useState<
    string[]
  >([]);
  const { t } = useTranslation();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["80%"], []);
  const handlePresentNewChatModal = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const { showActionSheetWithOptions } = useActionSheet();

  const showMyActionSheet = (
    chat: Chat,
    isCurrentUserAdmin: boolean,
    isCurrentChatParticipantHidden: boolean
  ) => {
    const options = [
      isCurrentUserAdmin ? t("common:edit") : t("common:info"),
      isCurrentChatParticipantHidden ? t("common:show") : t("common:hide"),
      t("common:leave"),
      t("common:cancel"),
    ];
    let destructiveButtonIndex = 2;
    let cancelButtonIndex = 3;

    if (chat.chat_type === "1-1") {
      options.shift();
      destructiveButtonIndex--;
      cancelButtonIndex--;
    }

    showActionSheet(
      { showActionSheetWithOptions, colorScheme },
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (index) => {
        let current_index = index || 0;
        if (chat.chat_type === "1-1") {
          current_index++;
        }
        if (current_index === 0) {
          router.push(`/chat/manage/${chat.id}`);
        } else if (current_index === 1) {
          updateChatParticipantStatus(
            isCurrentChatParticipantHidden ? "joined" : "hidden",
            chat.id
          );
        } else if (current_index === 2) {
          updateChatParticipantStatus("left", chat.id);
        }
      }
    );
  };

  function clearNewChat() {
    setNewChatName("");
    setNewChatType("group");
    setNewChatParticipants([]);
  }

  const getCurrentUserFriends = async () => {
    const { data, error } = await sb
      .from("my_friends")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setCurrentUserFriends(data);
  };

  const getFriendsWith1on1Chats = async () => {
    const { data, error } = await sb.rpc("get_friends_with_1on1_chats");

    if (error) {
      console.error(error);
      return;
    }

    setFriendsWith1on1Chats(data);
  };

  function orderChats(chats: Chat[]) {
    return chats.sort((a, b) => {
      if ((a.chat_messages?.length ?? 0) === 0) {
        return -1;
      }
      if ((b.chat_messages?.length ?? 0) === 0) {
        return 1;
      }
      return (
        new Date(b.chat_messages![0].created_at).getTime() -
        new Date(a.chat_messages![0].created_at).getTime()
      );
    });
  }

  const getChats = async () => {
    setIsLoadingChats(true);
    const { data, error } = await sb
      .from("chats")
      .select(
        "*, participants:chat_participants(*, user:users(*)), chat_messages(id, text, created_at, user:users(id, name))"
      )
      .eq("is_active", true)
      // only chats that I am a part of (not 'left')
      .order("created_at", {
        referencedTable: "chat_messages",
        ascending: false,
      })
      .limit(1, {
        foreignTable: "chat_messages",
      });
    if (error) {
      console.error(error);
      return;
    }
    setChats(orderChats(data as unknown as Chat[]));
    setIsLoadingChats(false);
  };

  React.useEffect(() => {
    getChats();
    getCurrentUserFriends();
    getFriendsWith1on1Chats();
  }, []);

  React.useEffect(() => {
    const chatChannel = sb
      .channel("chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
        },
        async (payload) => {
          getChats();
        }
      )
      .subscribe();

    const chatMessageChannel = sb
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          getChats();
        }
      )
      .subscribe();

    return () => {
      chatChannel.unsubscribe();
      chatMessageChannel.unsubscribe();
    };
  }, []);

  const [filteredChats, setFilteredChats] = React.useState<Chat[]>(chats);

  useEffect(() => {
    setFilteredChats(
      chats.filter((chat) =>
        chat.participants.some(
          (participant) =>
            participant.user.id === session?.user.id &&
            participant.status === currentChatParticipantStatus
        )
      )
    );
  }, [chats, currentChatParticipantStatus]);

  const updateChatParticipantStatus = async (
    status: "joined" | "invited" | "hidden" | "left",
    chatId: string
  ) => {
    await sb
      .from("chat_participants")
      .update({
        status,
      })
      .eq("chat_id", chatId)
      .eq("user_id", session?.user.id as string);

    getChats();
  };

  const archiveChat = async (chatId: string) => {
    await sb
      .from("chats")
      .update({
        is_active: false,
      })
      .eq("id", chatId);

    getChats();
  };

  return (
    <Background style={tw`pt-5 px-5`} showScroll={false}>
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
        <View style={tw`flex-1 justify-between`}>
          <View style={tw`flex-1`}>
            {newChatType === "group" && (
              <Input
                label={t("common:name")}
                defaultValue={newChatName}
                onChangeText={(text) => setNewChatName(text)}
              />
            )}

            <Picker
              selectedValue={newChatType}
              onValueChange={(itemValue) => {
                setNewChatType(itemValue as any);
                if (itemValue === "1-1") {
                  setNewChatParticipants([]);
                }
              }}
              style={tw`text-primary dark:text-dark-primary w-full`}
              dropdownIconColor={tw.color("primary")}
            >
              <Picker.Item label={t("common:1-1")} value="1-1" />
              <Picker.Item label={t("common:group")} value="group" />
            </Picker>

            <ScrollView style={tw`flex-1`}>
              <FlatList
                data={currentUserFriends}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <ListEmptyText text={t("common:no-friends-found")} />
                }
                renderItem={({ item }) =>
                  // if it's a 1-1 chat, only show the friends not already in a 1-1 chat
                  newChatType === "1-1" &&
                  friendsWith1on1Chats?.some(
                    (friend) => friend === item.id
                  ) ? null : (
                    <View
                      style={tw`flex-row items-center justify-between mb-2`}
                    >
                      <View style={tw`flex-row items-center gap-2`}>
                        <Avatar size={40} userId={item.id} />
                        <Text>{item.name}</Text>
                      </View>
                      <Checkbox
                        value={newChatParticipants.includes(item.id)}
                        onValueChange={(value) => {
                          if (newChatType === "1-1") {
                            setNewChatParticipants([item.id]);
                          } else {
                            setNewChatParticipants(
                              value
                                ? [...newChatParticipants, item.id]
                                : newChatParticipants.filter(
                                    (id) => id !== item.id
                                  )
                            );
                          }
                        }}
                      />
                    </View>
                  )
                }
              />
            </ScrollView>
          </View>

          <KeyboardAvoidingView behavior="padding">
            <Button
              onPress={async () => {
                const { data: newChatId } = await sb.rpc(
                  "create_chat_with_admin",
                  {
                    chat_name: newChatName,
                    chat_type: newChatType,
                  }
                );

                const { error } = await sb.from("chat_participants").insert(
                  newChatParticipants.map((participant) => ({
                    chat_id: newChatId as string,
                    user_id: participant,
                    status: "invited",
                  }))
                );

                if (error) {
                  console.error(error);
                  return;
                }

                getChats();
                getFriendsWith1on1Chats();
                clearNewChat();
                bottomSheetModalRef.current?.dismiss();
              }}
              label={t("common:create")}
              disabled={
                (newChatType === "group" &&
                  (newChatName.length === 0 ||
                    newChatParticipants.length === 0)) ||
                (newChatType === "1-1" && newChatParticipants.length === 0)
              }
              style={tw`mb-21 mt-5`}
              icon={<PlusIcon size={24} color={tw.color("background")} />}
            />
          </KeyboardAvoidingView>
        </View>
      </BottomSheetModal>

      <View style={tw`flex-col w-full`}>
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <Picker
            selectedValue={currentChatParticipantStatus}
            onValueChange={(itemValue) =>
              setCurrentChatParticipantStatus(itemValue as any)
            }
            style={tw`text-primary dark:text-dark-primary w-full flex-1`}
            dropdownIconColor={
              colorScheme === "dark"
                ? tw.color("dark-primary")
                : tw.color("primary")
            }
          >
            <Picker.Item label={t("common:joined")} value="joined" />
            <Picker.Item label={t("common:invited")} value="invited" />
            <Picker.Item label={t("common:hidden")} value="hidden" />
          </Picker>
          <Button
            onPress={async () => {
              handlePresentNewChatModal();
            }}
            label={t("common:new-chat")}
            icon={<PlusIcon size={24} color={tw.color("background")} />}
          />
        </View>

        {isLoadingChats ? (
          <ContentLoader
            speed={2}
            width={400}
            height={600} // Adjust based on height
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
            {Array.from({ length: 8 }).map((_, index) => (
              <View key={index}>
                <Circle cx="40" cy={30 + index * 60} r="25" />
                <Rect
                  x="75"
                  y={15 + index * 60}
                  rx="4"
                  ry="3"
                  width="100"
                  height="13"
                />
                <Rect
                  x="75"
                  y={35 + index * 60}
                  rx="3"
                  ry="2"
                  width="50"
                  height="10"
                />
              </View>
            ))}
          </ContentLoader>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <ListEmptyText text={t("common:no-chats-found")} />
            }
            refreshControl={
              <RefreshControl
                refreshing={isLoadingChats}
                onRefresh={() => {
                  getChats();
                }}
              />
            }
            renderItem={({ item: chat }) => {
              const isCurrentUserAdmin = chat.participants.find(
                (participant) => participant.user.id === session?.user.id
              )?.is_admin;

              const isCurrentChatParticipantHidden = chat.participants.find(
                (participant) =>
                  participant.user.id === session?.user.id &&
                  participant.status === "hidden"
              );

              const handleLongPress = () => {
                showMyActionSheet(
                  chat,
                  isCurrentUserAdmin as boolean,
                  isCurrentChatParticipantHidden !== undefined
                );
              };

              // if the user is invited, they can only leave the chat or join it
              if (
                chat.participants.find(
                  (participant) =>
                    participant.user.id === session?.user.id &&
                    participant.status === "invited"
                )
              ) {
                return (
                  <View
                    key={chat.id}
                    style={tw`flex-row items-center gap-3 bg-new-bg p-2 rounded-xl overflow-hidden`}
                  >
                    {chat.chat_type === "1-1" ? (
                      <Avatar
                        size={50}
                        userId={
                          getOtherChatUsers(chat, session?.user.id as string)[0]
                            .user.id
                        }
                      />
                    ) : // check if it's only two members
                    chat.participants.length === 2 ? (
                      <View
                        style={tw`flex-row gap-1 w-12 h-12 bg-mt-fg rounded-full items-center justify-center`}
                      >
                        {chat.participants.map((participant) => (
                          <Avatar
                            size={22}
                            userId={participant.user.id}
                            key={participant.user.id}
                          />
                        ))}
                      </View>
                    ) : (
                      <View
                        style={tw`flex-row gap-1 w-12 h-12 flex-wrap bg-mt-fg rounded-full items-center justify-center`}
                      >
                        {chat.participants.slice(0, 4).map((participant) => (
                          <Avatar
                            size={22}
                            userId={participant.user.id}
                            key={participant.user.id}
                          />
                        ))}
                      </View>
                    )}
                    <View
                      key={chat.id}
                      style={tw`w-full flex-1 flex-row gap-3 justify-between`}
                    >
                      <Text>
                        {chat.chat_type === "1-1"
                          ? getOtherChatUsers(
                              chat,
                              session?.user.id as string
                            )[0].user.name
                          : chat.name}
                      </Text>

                      <View style={tw`flex-row gap-3`}>
                        <TouchableOpacity
                          onPress={async () => {
                            updateChatParticipantStatus("left", chat.id);
                          }}
                          style={tw`flex-row items-center gap-1`}
                        >
                          <LogOutIcon
                            size={24}
                            color={tw.color("destructive")}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={async () => {
                            updateChatParticipantStatus("joined", chat.id);
                          }}
                          style={tw`flex-row items-center gap-1`}
                        >
                          <LogInIcon size={24} color={tw.color("accent")} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={chat.id}
                  onLongPress={handleLongPress}
                  onPress={() => {
                    chat.participants.forEach((participant) => {
                      if (participant.user.id === session?.user.id) {
                        participant.last_read_at = new Date().toISOString();
                      }
                    });
                    router.push(`/chat/messages/${chat.id}`);
                  }}
                >
                  <View
                    key={chat.id}
                    style={tw`flex-row items-center gap-3 bg-bg p-2 rounded-xl overflow-hidden`}
                  >
                    {chat.chat_type === "1-1" ? (
                      <Avatar
                        size={50}
                        userId={
                          getOtherChatUsers(chat, session?.user.id as string)[0]
                            .user.id
                        }
                      />
                    ) : // check if it's only two members
                    chat.participants.length === 2 ? (
                      <View
                        style={tw`flex-row gap-1 w-12 h-12 bg-mt-fg rounded-full items-center justify-center`}
                      >
                        {chat.participants.map((participant) => (
                          <Avatar
                            size={22}
                            userId={participant.user.id}
                            key={participant.user.id}
                          />
                        ))}
                      </View>
                    ) : (
                      <View
                        style={tw`flex-row gap-1 w-12 h-12 flex-wrap bg-mt-fg rounded-full items-center justify-center`}
                      >
                        {chat.participants.slice(0, 4).map((participant) => (
                          <Avatar
                            size={22}
                            userId={participant.user.id}
                            key={participant.user.id}
                          />
                        ))}
                      </View>
                    )}
                    <View style={tw`w-full flex-1`}>
                      <View style={tw`flex-col gap-1`}>
                        <Text>
                          {chat.chat_type === "1-1"
                            ? getOtherChatUsers(
                                chat,
                                session?.user.id as string
                              )[0].user.name
                            : chat.name}
                        </Text>

                        {chat.chat_messages?.[0] && (
                          <View style={tw`flex-row gap-1`}>
                            <Text
                              style={
                                new Date(
                                  chat.chat_messages?.[0]?.created_at as string
                                ) >
                                  new Date(
                                    chat.participants.find(
                                      (participant) =>
                                        participant.user.id === session?.user.id
                                    )?.last_read_at as string
                                  ) &&
                                chat.chat_messages?.[0]?.user.id !==
                                  session?.user.id
                                  ? {
                                      fontFamily: fonts.inter.semiBold,
                                    }
                                  : tw`text-muted-foreground dark:text-dark-muted-foreground`
                              }
                            >
                              {chat.chat_messages?.[0]?.user.name}:{" "}
                              {chat.chat_messages?.[0]?.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Background>
  );
};

export default ChatIndex;
