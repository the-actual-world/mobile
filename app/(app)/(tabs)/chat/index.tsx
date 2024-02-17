import React from "react";
import { Link } from "expo-router";
import { Background } from "@/components/Background";
import { Text } from "@/components/ui/Text";
import { useSupabase } from "@/context/useSupabase";
import { getOtherChatUsers } from "@/lib/utils";
import tw from "@/lib/tailwind";
import { FlatList, RefreshControl, View } from "react-native";
import Avatar from "@/components/Avatar";
import { FloatingAction } from "react-native-floating-action";

const actions = [
  {
    text: "Location",
    icon: {
      uri: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
    },
    name: "bt_room",
    position: 3,
  },
];

const ChatIndex = () => {
  const { sb, session } = useSupabase();

  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(false);

  function orderChats(chats: Chat[]) {
    return chats.sort((a, b) => {
      if (a.chat_messages.length === 0) {
        return -1;
      }
      if (b.chat_messages.length === 0) {
        return 1;
      }
      return (
        new Date(b.chat_messages[0].created_at).getTime() -
        new Date(a.chat_messages[0].created_at).getTime()
      );
    });
  }

  const getChats = async () => {
    const { data, error } = await sb
      .from("chats")
      .select(
        "*, participants:chat_participants(chat_id, is_admin, user:users(*)), chat_messages(id, text, created_at, user:users(id, name))"
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
    setChats(orderChats(data as Chat[]));
  };

  React.useEffect(() => {
    getChats();
  }, []);

  return (
    <Background style={tw`pt-5`}>
      <View style={tw`flex-col w-full`}>
        <FlatList
          data={chats}
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
            <View key={chat.id} style={tw`flex-row items-center gap-3 mb-3`}>
              {chat.chat_type === "1-1" ? (
                <Avatar
                  size={50}
                  userId={
                    getOtherChatUsers(chat, session?.user.id as string)[0].user
                      .id
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
                    {chat.chat_messages.slice(0, 2).map((message) => (
                      <Text key={message.id} style={tw`text-mt-fg`}>
                        {message.user.name.split(" ")[0] || message.user.name}:{" "}
                        {message.text}
                      </Text>
                    ))}
                  </View>
                </View>
              </Link>
            </View>
          )}
        />
      </View>

      <FloatingAction
        actions={actions}
        onPressItem={(name) => {
          console.log(`selected button: ${name}`);
        }}
      />
    </Background>
  );
};

export default ChatIndex;
