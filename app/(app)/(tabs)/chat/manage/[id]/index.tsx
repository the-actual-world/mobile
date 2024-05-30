import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Alert } from "react-native";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { Input } from "@/components/ui/Input";
import { Background } from "@/components/Background";
import { Button } from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "@/lib/tailwind";
import { BanIcon, SaveIcon, UserCogIcon } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import Avatar from "@/components/Avatar";
import { useTranslation } from "react-i18next";
import { fonts } from "@/lib/styles";
import { showActionSheet } from "@/lib/utils";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useColorScheme } from "@/context/ColorSchemeProvider";

export default () => {
  const { session } = useSupabase();
  const [chatName, setChatName] = useState("");

  // get type from chat_participants and users
  type ChatParticipant = Tables<"chat_participants"> & {
    user: Tables<"users"> | null;
  };

  const [chatParticipants, setChatParticipants] = useState<ChatParticipant[]>(
    []
  );
  const [friends, setFriends] = useState<Tables<"my_friends">[]>([]);
  const [friendsNotInChat, setFriendsNotInChat] = useState<
    Tables<"my_friends">[]
  >([]);
  const { id: chatId } = useLocalSearchParams();
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (chatId) {
      fetchChatDetails(chatId as string);
    }
  }, [chatId]);

  useEffect(() => {
    if (friends.length && chatParticipants.length) {
      const friendsNotInChat = friends.filter(
        (friend) =>
          !chatParticipants.find(
            (participant) => participant.user_id === friend.id
          )
      );
      setFriendsNotInChat(friendsNotInChat);
    }
  }, [friends, chatParticipants]);

  const fetchChatDetails = async (chatId: string) => {
    const { data: chatData } = await sb
      .from("chats")
      .select(
        `
      name,
      participants:chat_participants(*, user:users(*))
    `
      )
      .eq("id", chatId)
      .single();

    if (chatData) {
      setChatName(chatData.name as string);
      setChatParticipants(chatData.participants);
    }

    const { data: friendsData } = await sb
      .from("my_friends")
      .select("*")
      .order("name", { ascending: true });
    setFriends(friendsData!);

    const isAdmin = chatData?.participants.find(
      (participant: ChatParticipant) =>
        participant.user_id === session?.user?.id && participant.is_admin
    );
    setIsCurrentUserAdmin(isAdmin ? true : false);
  };

  const saveChatName = async () => {
    await sb
      .from("chats")
      .update({ name: chatName })
      .eq("id", chatId as string);
  };

  const promoteParticipant = async (userId: string) => {
    await sb
      .from("chat_participants")
      .update({ is_admin: true })
      .eq("user_id", userId)
      .eq("chat_id", chatId as string);
    await fetchChatDetails(chatId as string);
  };

  const demoteParticipant = async (userId: string) => {
    await sb
      .from("chat_participants")
      .update({ is_admin: false })
      .eq("user_id", userId)
      .eq("chat_id", chatId as string);
    await fetchChatDetails(chatId as string);
  };

  const kickParticipant = async (userId: string) => {
    await sb
      .from("chat_participants")
      .update({ status: "left" })
      .eq("user_id", userId)
      .eq("chat_id", chatId as string);
    await fetchChatDetails(chatId as string);
  };

  const inviteParticipant = async (userId: string) => {
    const result = await sb.rpc("invite_user_to_chat", {
      userid: userId,
      chatid: chatId as string,
    });

    if (result.error) {
      console.error(result.error);
    }

    await fetchChatDetails(chatId as string);
  };

  const { showActionSheetWithOptions } = useActionSheet();

  const showCustomActionSheet = (participant: ChatParticipant) => {
    const currentUserNotAdminOptions = [
      t("common:checkout_profile"),
      t("common:cancel"),
    ];

    const currentUserAdminOptions = [
      t("common:checkout_profile"),
      participant.is_admin ? t("common:demote") : t("common:promote"),
      t("common:kick"),
      t("common:cancel"),
    ].filter(Boolean);

    // if the current user is not an admin, show the options without the promote/demote and kick options
    if (!isCurrentUserAdmin) {
      showActionSheet(
        { showActionSheetWithOptions, colorScheme },
        {
          options: currentUserNotAdminOptions,
          cancelButtonIndex: currentUserNotAdminOptions.length - 1,
        },
        (index) => {
          if (
            currentUserNotAdminOptions[index] === t("common:checkout_profile")
          ) {
            router.push(`/home/user/${participant.user_id}`);
          }
        }
      );
    } else {
      showActionSheet(
        { showActionSheetWithOptions, colorScheme },
        {
          options: currentUserAdminOptions,
          cancelButtonIndex: currentUserAdminOptions.length - 1,
          destructiveButtonIndex: currentUserAdminOptions.indexOf(
            t("common:kick")
          ),
        },
        (index) => {
          if (currentUserAdminOptions[index] === t("common:checkout_profile")) {
            router.push(`/home/users/${participant.user_id}`);
          } else if (currentUserAdminOptions[index] === t("common:promote")) {
            promoteParticipant(participant.user_id);
          } else if (currentUserAdminOptions[index] === t("common:demote")) {
            demoteParticipant(participant.user_id);
          } else if (currentUserAdminOptions[index] === t("common:kick")) {
            kickParticipant(participant.user_id);
          }
        }
      );
    }
  };

  return (
    <Background showScroll={false} style={tw`w-full items-stretch`}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: chatName as string,
        }}
      />
      <View style={tw`justify-between h-full gap-3`}>
        <View style={tw`flex-1`}>
          <View style={tw`mb-4`}>
            {isCurrentUserAdmin ? (
              <View style={tw`flex-row items-center gap-3 w-full`}>
                <Input
                  value={chatName}
                  onChangeText={setChatName}
                  placeholder="Chat Name"
                  style={tw`flex-grow`}
                />
                <TouchableOpacity
                  onPress={() => {
                    saveChatName();
                  }}
                >
                  <SaveIcon size={25} color={tw.color("accent")} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text
                style={[
                  tw`
                  text-2xl
                  text-center
                  w-full
                `,
                  {
                    fontFamily: fonts.inter.bold,
                  },
                ]}
              >
                {chatName}
              </Text>
            )}
          </View>

          <FlatList
            data={chatParticipants}
            contentContainerStyle={tw`flex-grow`}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.user_id}
                onLongPress={() => showCustomActionSheet(item)}
              >
                <View
                  style={tw`flex-row items-center justify-between gap-2 mb-3`}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <Avatar userId={item.user_id} size={40} />
                    <Text>{item.user?.name}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-2`}>
                    {item.status === "invited" && (
                      <Text
                        style={tw`
                      bg-accent rounded-full px-2 py-1 text-background dark:text-dark-background text-xs
                      `}
                      >
                        {t("common:invited")}
                      </Text>
                    )}
                    {item.is_admin && (
                      <Text
                        style={tw`
                      bg-destructive rounded-full px-2 py-1 text-background dark:text-dark-background text-xs
                      `}
                      >
                        {t("common:admin")}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.user_id}
          />
        </View>

        {isCurrentUserAdmin && (
          <View style={tw`w-full`}>
            <Text
              style={[
                tw`text-lg mb-2`,
                {
                  fontFamily: fonts.inter.bold,
                },
              ]}
            >
              {t("common:invite-friends")}
            </Text>
            <FlatList
              data={friendsNotInChat}
              ListEmptyComponent={() => (
                <Text style={tw`text-center`}>
                  {t("common:no-friends-to-invite")}
                </Text>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={tw`flex-row items-center gap-2 px-3 py-2 bg-mt rounded-xl`}
                  onPress={() => {
                    inviteParticipant(item.id as string);
                  }}
                >
                  <Avatar userId={item.id as string} size={25} />
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id as string}
              horizontal
              contentContainerStyle={tw`gap-3 items-end mb-6`}
            />
          </View>
        )}
      </View>
    </Background>
  );
};
