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
import { Friend } from "@/lib/types";
import { useFriends } from "@/context/FriendsProvider";

export default function Index() {
  const { t } = useTranslation();

  // const [friends, setFriends] = React.useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = React.useState(false);
  const router = useRouter();
  const { session } = useSupabase();
  const { friends } = useFriends();

  const { colorScheme } = useColorScheme();
  const alertRef = useAlert();

  return (
    <Background showScroll={false}>
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

      <View style={tw`flex-1 w-full`}>
        {friends.length > 0 ? (
          <View style={tw`flex-1 items-center justify-between`}>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.user.id as string}
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
                              await sb
                                .from("friends")
                                .update({
                                  status: "accepted",
                                })
                                .eq("sender_id", item.user.id);
                            }
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
            </View>
          </>
        )}
      </View>
    </Background>
  );
}
