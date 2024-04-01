import { Text } from "@/components/ui/Text";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import tw from "@/lib/tailwind";
import { FlashList } from "@shopify/flash-list";
import { Background } from "@/components/Background";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { Link, Stack, useRouter } from "expo-router";
import { useAlert } from "@/context/AlertProvider";
import { FlatList, RotationGestureHandler } from "react-native-gesture-handler";
import { Button } from "@/components/ui/Button";
import {
  CameraIcon,
  QrCodeIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react-native";
import { Image } from "expo-image";
import Avatar from "@/components/Avatar";

export default function Index() {
  const { t } = useTranslation();

  type Friend = {
    user: {
      id: string;
      name: string;
      type: string; // sender or receiver
    };
    status: string; // accepted or rejected or pending
  };

  type FetchedFriend = {
    sender: {
      id: string;
      name: string;
    };
    receiver: {
      id: string;
      name: string;
    };
    status: string; // accepted or rejected or pending
  };

  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = React.useState(false);
  const router = useRouter();

  const { colorScheme } = useColorScheme();
  const alertRef = useAlert();

  const getFriends = async () => {
    setIsLoadingFriends(true);

    // table friends: sender_id, receiver_id, status
    // fetch all friends where receiver_id is current user or where sender_id is current user and status is accepted
    const { data: fetchedFriends, error } = await sb
      .from("friends")
      .select(
        "sender: sender_id(id, name), receiver: receiver_id(id, name), status"
      );

    if (error) {
      alertRef.current?.showAlert({
        title: t("common:error"),
        message: error.message,
        variant: "destructive",
      });
      return;
    }

    const currentUserId = (await sb.auth.getUser()).data.user?.id;
    const newFriends = fetchedFriends as unknown as FetchedFriend[];

    console.log(JSON.stringify(newFriends));

    // put the friends in the correct format
    let friends: Friend[] = [];
    newFriends.forEach((friend) => {
      if (friend.receiver.id === currentUserId) {
        friends.push({
          user: {
            id: friend.sender.id,
            name: friend.sender.name,
            type: "sender",
          },
          status: friend.status,
        });
      } else {
        friends.push({
          user: {
            id: friend.receiver.id,
            name: friend.receiver.name,
            type: "receiver",
          },
          status: friend.status,
        });
      }
    });

    console.log(JSON.stringify(friends));

    setFriends(friends);
    setIsLoadingFriends(false);
  };

  React.useEffect(() => {
    getFriends();
  }, []);

  return (
    <Background style={tw`flex-1 pt-6`} showScroll={false}>
      {/* <Button
        onPress={() => router.push("/settings/add-friend")}
        icon={<CameraIcon size={20} color={"white"} />}
        label={t("settings:addFriend")}
      />
      <View style={tw`pt-2`} />
      <Button
        onPress={() => router.push("/settings/my-friend-address")}
        icon={<QrCodeIcon size={20} color={"white"} />}
        label={t("settings:myFriendAddress")}
        variant="accent"
      /> */}

      <View style={{ flex: 1, width: "100%" }}>
        {friends.length > 0 ? (
          <View style={tw`flex-1 items-center justify-between`}>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.user.id as string}
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingFriends}
                  onRefresh={() => {
                    setIsLoadingFriends(true);
                    getFriends();
                    setIsLoadingFriends(false);
                  }}
                />
              }
              renderItem={({ item }) => (
                <View
                  style={tw`flex-row items-center w-full justify-between mb-3`}
                >
                  <View style={tw`flex-row items-center gap-x-2`}>
                    <Avatar userId={item.user.id} size={36} />
                    <Text style={tw`text-lg`}>{item.user.name}</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-x-2`}>
                    {item.status === "pending" ? (
                      <>
                        <TouchableOpacity
                          onPress={async () => {
                            if (item.user.type === "sender") {
                              // accept friend request
                              await sb
                                .from("friends")
                                .update({
                                  status: "accepted",
                                })
                                .eq("sender_id", item.user.id);
                            }
                            getFriends();
                          }}
                        >
                          <ThumbsUpIcon size={24} color={tw.color("accent")} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={async () => {
                            if (item.user.type === "sender") {
                              await sb
                                .from("friends")
                                .delete()
                                .eq("sender_id", item.user.id);
                            }
                            getFriends();
                          }}
                        >
                          <ThumbsDownIcon
                            size={24}
                            color={tw.color("destructive")}
                          />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={async () => {
                          if (item.user.type === "sender") {
                            await sb
                              .from("friends")
                              .delete()
                              .eq("sender_id", item.user.id);
                          } else {
                            await sb
                              .from("friends")
                              .delete()
                              .eq("receiver_id", item.user.id);
                          }
                          getFriends();
                        }}
                      >
                        <Trash2Icon size={24} color={tw.color("destructive")} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        ) : (
          <>
            {isLoadingFriends && (
              <View style={tw`h-16 items-center justify-center`}>
                <ActivityIndicator size="large" color={tw.color("accent")} />
              </View>
            )}
            <View style={tw`items-center px-8 gap-y-2`}>
              <Text style={tw`muted`}>{t("settings:noFriends")}</Text>
              <Image
                source={require("@/assets/gifs/tumbleweed.gif")}
                style={tw`w-full h-32 rounded-lg`}
              />
              {/* Refresh button */}
              <Button
                onPress={() => {
                  getFriends();
                }}
                icon={<RefreshCwIcon size={20} color="white" />}
                label={t("settings:refresh")}
                variant="accent"
              />
            </View>
          </>
        )}
      </View>
    </Background>
  );
}
