import { Text } from "@/components/ui/Text";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import tw from "@/lib/tailwind";
import { FlashList } from "@shopify/flash-list";
import { Background } from "@/components/Background";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { Link } from "expo-router";
import { Button } from "@/components/ui/Button";
import { BadgePlusIcon, RefreshCwIcon, Trash2Icon } from "lucide-react-native";
import { useAlert } from "@/context/AlertProvider";
import { useFriends } from "@/context/FriendsProvider";
import { useCredits } from "@/context/CreditsProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Avatar from "@/components/Avatar";
import { fonts } from "@/lib/styles";

export default () => {
  const { t } = useTranslation();

  const { colorScheme } = useColorScheme();
  const { friends, getFriendById } = useFriends();
  const { transactions, totalCredits } = useCredits();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["40%"], []);

  const [selectedFriendIdToGive, setSelectedFriendIdToGive] = React.useState<
    string | null
  >(null);
  const [selectedAmountToGive, setSelectedAmountToGive] = React.useState(1000);

  async function giftFriend(receiver_id: string, gift_amount: number) {
    const { data: success } = await sb.rpc("gift_credits", {
      receiver_id,
      gift_amount,
    });

    if (!success) {
      alertRef.current?.showAlert({
        title: t("common:error"),
        message: t("credits:credits-not-given"),
        variant: "destructive",
      });
      return;
    }

    alertRef.current?.showAlert({
      title: t("common:success"),
      message: t("credits:credits-given"),
      variant: "default",
    });
  }

  const alertRef = useAlert();

  return (
    <Background>
      <ScrollView style={tw`flex-1`}>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.user.id}
          scrollEnabled={false}
          contentContainerStyle={tw`gap-2`}
          renderItem={({ item }) => {
            if (item.status === "accepted") {
              return (
                <TouchableOpacity
                  style={tw`flex-row items-center gap-2 px-3 py-2 bg-background dark:bg-dark-background rounded-xl`}
                  onPress={() => {
                    setSelectedFriendIdToGive(item.user.id);
                    bottomSheetModalRef.current?.present();
                  }}
                >
                  <Avatar userId={item.user.id as string} size={32} />
                  <Text>{item.user.name}</Text>
                </TouchableOpacity>
              );
            }
            return null;
          }}
        />
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-background dark:bg-dark-background`}
        handleIndicatorStyle={tw`bg-muted-foreground dark:bg-dark-muted-foreground`}
        style={tw`px-6 py-4`}
      >
        <Text
          style={[
            tw`text-xl mb-3`,
            {
              fontFamily: fonts.inter.semiBold,
            },
          ]}
        >
          {t("settings:give-credits-to")}{" "}
          {getFriendById(selectedFriendIdToGive!).user.name}
        </Text>

        <BottomSheetInput
          label={t("settings:amount")}
          style={tw`mb-4`}
          value={selectedAmountToGive.toString()}
          onChangeText={(text) => setSelectedAmountToGive(parseInt(text) || 0)}
          keyboardType="number-pad"
        />

        <Button
          label={t("settings:give")}
          disabled={
            selectedFriendIdToGive === null ||
            selectedAmountToGive < 100 ||
            selectedAmountToGive > totalCredits
          }
          onPress={async () => {
            await giftFriend(selectedFriendIdToGive!, selectedAmountToGive);
            bottomSheetModalRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
    </Background>
  );
};
