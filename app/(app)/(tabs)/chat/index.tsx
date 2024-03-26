import React, { useEffect } from "react";
import { Link } from "expo-router";
import { Background } from "@/components/Background";
import { Text } from "@/components/ui/Text";
import { useSupabase } from "@/context/useSupabase";
import { getOtherChatUsers } from "@/lib/utils";
import tw from "@/lib/tailwind";
import { FlatList, RefreshControl, View } from "react-native";
import Avatar from "@/components/Avatar";
//@ts-ignore
import { HoldItem } from "react-native-hold-menu";
import { FloatingAction } from "react-native-floating-action";
import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";
import { PlusIcon } from "lucide-react-native";
import { useColorScheme } from "@/context/ColorSchemeProvider";

const ChatIndex = () => {
  const { sb, session } = useSupabase();

  const { colorScheme } = useColorScheme();

  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(false);

  const [currentChatParticipantStatus, setCurrentChatParticipantStatus] =
    React.useState<"invited" | "joined" | "hidden">("joined");

  const { t } = useTranslation();

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
    const { data, error } = await sb
      .from("chats")
      .select(
        "*, participants:chat_participants(chat_id, is_admin, status, user:users(*)), chat_messages(id, text, created_at, user:users(id, name))"
      )
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
  };

  React.useEffect(() => {
    getChats();
  }, []);

  async function createChat() {
    const chat_id = await sb.rpc("create_chat_with_admin", {
      chat_name: "New Chat",
      chat_type: "group",
    });
  }

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

    const chatParticipantChannel = sb
      .channel("chat_participants")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_participants",
        },
        async (payload) => {
          getChats();
        }
      )
      .subscribe();

    return () => {
      chatChannel.unsubscribe();
      chatParticipantChannel.unsubscribe();
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

  return (
    <Background style={tw`pt-5`}>
      <View style={tw`flex-col w-full`}>
        <Picker
          selectedValue={currentChatParticipantStatus}
          onValueChange={(itemValue) =>
            setCurrentChatParticipantStatus(itemValue as any)
          }
          style={tw`text-primary dark:text-dark-primary`}
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

        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChats}
              onRefresh={() => {
                setIsLoadingChats(true);
                getChats();
                setIsLoadingChats(false);
              }}
            />
          }
          renderItem={({ item: chat }) => (
            <HoldItem
              items={
                chat.chat_type === "1-1"
                  ? [
                      {
                        text: t("common:actions"),
                        icon: "home",
                        isTitle: true,
                      },
                      {
                        text: t("common:hide"),
                        icon: "eye-off",
                        onPress: () => {},
                      },
                      {
                        text: t("common:archive"),
                        icon: "archive",
                        isDestructive: true,
                        onPress: () => {},
                      },
                    ]
                  : chat.participants.find(
                      (participant) => participant.user.id === session?.user.id
                    )?.is_admin
                  ? [
                      {
                        text: t("common:actions"),
                        icon: "home",
                        isTitle: true,
                      },
                      {
                        text: t("common:edit"),
                        icon: "edit",
                        onPress: () => {},
                      },
                      {
                        text: t("common:leave"),
                        icon: "log-out",
                        isDestructive: true,
                        onPress: async () => {
                          await sb
                            .from("chat_participants")
                            .update({
                              status: "left",
                            })
                            .eq("chat_id", chat.id)
                            .eq("user_id", session?.user.id as string);
                        },
                      },
                      {
                        text: t("common:archive"),
                        icon: "trash",
                        isDestructive: true,
                        onPress: async () => {},
                      },
                    ]
                  : [
                      {
                        text: t("common:actions"),
                        icon: "home",
                        isTitle: true,
                      },
                      {
                        text: t("common:info"),
                        icon: "info",
                        onPress: () => {},
                      },
                      {
                        text: t("common:leave"),
                        icon: "log-out",
                        isDestructive: true,
                        onPress: async () => {
                          await sb
                            .from("chat_participants")
                            .update({
                              status: "left",
                            })
                            .eq("chat_id", chat.id)
                            .eq("user_id", session?.user.id as string);
                        },
                      },
                    ]
              }
            >
              <View
                key={chat.id}
                style={tw`flex-row items-center gap-3 mb-3 bg-new-bg p-2 rounded-xl overflow-hidden`}
              >
                {chat.chat_type === "1-1" ? (
                  <Avatar
                    size={50}
                    userId={
                      getOtherChatUsers(chat, session?.user.id as string)[0]
                        .user.id
                    }
                  />
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
                <Link
                  key={chat.id}
                  href={{
                    pathname: "/chat/messages/[id]",
                    params: { id: chat.id },
                  }}
                  style={tw`w-full flex-1`}
                >
                  <View style={tw`flex-col gap-1`}>
                    <Text>
                      {chat.chat_type === "1-1"
                        ? getOtherChatUsers(chat, session?.user.id as string)[0]
                            .user.name
                        : chat.name}
                    </Text>

                    <View style={tw`flex-row gap-1`}>
                      {chat.chat_messages?.slice(0, 2).map((message) => (
                        <Text key={message.id} style={tw`text-mt-fg`}>
                          {message.user.name.split(" ")[0] || message.user.name}
                          : {message.text}
                        </Text>
                      ))}
                    </View>
                  </View>
                </Link>
              </View>
            </HoldItem>
          )}
        />
      </View>
    </Background>
  );
};

export default ChatIndex;
