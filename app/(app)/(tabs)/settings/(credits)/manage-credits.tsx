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
  StyleSheet,
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
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  BotIcon,
  CameraIcon,
  CoinsIcon,
  GemIcon,
  GiftIcon,
  QrCodeIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TicketCheckIcon,
  Trash2Icon,
} from "lucide-react-native";
import { Image } from "expo-image";
import Avatar from "@/components/Avatar";
import { useCredits } from "@/context/CreditsProvider";
import { useTimeAgo } from "@/context/TimeAgoProvider";
import { useFriends } from "@/context/FriendsProvider";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { initializePaymentSheet, openPaymentSheet } from "@/lib/stripe";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { fonts } from "@/lib/styles";

export default function Index() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const alertRef = useAlert();
  const { transactions, loadMore, estimatedDailyCreditsSpent, totalCredits } =
    useCredits();
  const { getFriendById } = useFriends();
  const timeAgo = useTimeAgo();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["80%"], []);

  const SYSTEM_USERS = ["SYSTEM", "NEW_ACCOUNT", "BOUGHT"];
  const PRICE_PER_CREDIT = 0.0001;
  const PRESET_CREDIT_OFFERS = [10000, 20000, 50000, 100000];
  const [creditsToBuy, setCreditsToBuy] = React.useState<number>(0);

  return (
    <Background showScroll={false} style={tw`flex-1 gap-4`}>
      <View style={tw`items-stretch gap-2`}>
        <View style={tw`px-4 py-3 bg-mt rounded-lg`}>
          <Text style={tw`text-mt-fg`}>{t("settings:totalCredits")}</Text>
          <View style={tw`flex-row items-center gap-2`}>
            <Text style={tw`text-3xl`}>{totalCredits}</Text>
            <CoinsIcon
              size={24}
              color={
                colorScheme === "dark"
                  ? tw.color("dark-foreground")
                  : tw.color("foreground")
              }
            />
          </View>
        </View>

        <View style={tw`px-4 py-3 bg-mt rounded-lg`}>
          <Text style={tw`text-mt-fg`}>{t("settings:dailySpent")}</Text>
          <Text style={tw`text-3xl`}>
            {estimatedDailyCreditsSpent}{" "}
            <CoinsIcon
              size={24}
              color={
                colorScheme === "dark"
                  ? tw.color("dark-foreground")
                  : tw.color("foreground")
              }
            />
          </Text>
        </View>
      </View>

      <Button
        onPress={() => bottomSheetModalRef.current?.present()}
        label={t("settings:purchase")}
        icon={<ShoppingBagIcon size={24} color="white" />}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`gap-2 pb-20`}
        renderItem={({ item }) => (
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-2`}>
              {SYSTEM_USERS.includes(item.sender) ? (
                item.sender === "SYSTEM" ? (
                  <BotIcon
                    size={40}
                    color={
                      colorScheme === "dark"
                        ? tw.color("dark-foreground")
                        : tw.color("foreground")
                    }
                  />
                ) : item.sender === "NEW_ACCOUNT" ? (
                  <GemIcon
                    size={40}
                    color={
                      colorScheme === "dark"
                        ? tw.color("dark-foreground")
                        : tw.color("foreground")
                    }
                  />
                ) : item.sender === "BOUGHT" ? (
                  <ShoppingCartIcon
                    size={40}
                    color={
                      colorScheme === "dark"
                        ? tw.color("dark-foreground")
                        : tw.color("foreground")
                    }
                  />
                ) : null
              ) : (
                <Avatar size={40} userId={item.sender} />
              )}
              <View style={tw`flex-col items-start`}>
                <Text>
                  {item.sender === "SYSTEM"
                    ? t("common:system")
                    : item.sender === "NEW_ACCOUNT"
                    ? t("common:new-account")
                    : item.sender === "BOUGHT"
                    ? t("common:purchase")
                    : getFriendById(item.sender)?.user.name}
                </Text>
                <Text style={tw`text-sm text-mt-fg`}>
                  {timeAgo.format(new Date(item.created_at))}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center gap-2`}>
              <Text>
                {item.amount > 0 ? "+" : ""}
                {item.amount}
              </Text>
              {SYSTEM_USERS.includes(item.sender) ? (
                item.amount > 0 ? (
                  <ArrowDownIcon size={24} color={tw.color("primary")} />
                ) : (
                  <ArrowUpIcon size={24} color={tw.color("destructive")} />
                )
              ) : item.amount > 0 ? (
                <ArrowDownLeftIcon size={24} color={tw.color("primary")} />
              ) : (
                <ArrowUpRightIcon size={24} color={tw.color("destructive")} />
              )}
            </View>
          </View>
        )}
        onEndReached={() => loadMore(1)}
        onEndReachedThreshold={0.5}
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
        <Text style={tw`text-xl font-bold mb-4`}>
          {t("settings:buyCredits")}
        </Text>

        <Text style={tw`text-mt-fg mb-3`}>
          1€ = 10000{" "}
          <CoinsIcon
            size={12}
            strokeWidth={1}
            color={
              colorScheme === "dark"
                ? tw.color("dark-foreground")
                : tw.color("foreground")
            }
          />
        </Text>

        <View style={tw`gap-2 mb-3`}>
          {PRESET_CREDIT_OFFERS.map((offer) => (
            <TouchableOpacity
              key={offer}
              style={tw`flex-row items-center justify-center gap-2 p-4 bg-mt rounded-lg`}
              onPress={() => setCreditsToBuy(offer)}
            >
              <Text style={tw`text-xl font-bold`}>{offer}</Text>
              <CoinsIcon
                size={20}
                color={
                  colorScheme === "dark"
                    ? tw.color("dark-foreground")
                    : tw.color("foreground")
                }
              />
              <Text style={tw`text-mt-fg text-sm`}>
                ({(offer * PRICE_PER_CREDIT).toFixed(2)}€)
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={tw`flex-row justify-center items-center gap-2 mb-3`}>
          <Text style={[tw`text-4xl`, { fontFamily: fonts.inter.bold }]}>
            {creditsToBuy}
          </Text>
          <CoinsIcon
            size={32}
            color={
              colorScheme === "dark"
                ? tw.color("dark-foreground")
                : tw.color("foreground")
            }
          />
        </View>

        <Button
          label={t("settings:purchase")}
          disabled={creditsToBuy < 10000}
          onPress={async () => {
            await initializePaymentSheet(
              creditsToBuy,
              colorScheme === "dark" ? "alwaysDark" : "alwaysLight"
            );
            const payed = await openPaymentSheet();

            setCreditsToBuy(0);

            if (payed) {
              alertRef.current?.showAlert({
                title: t("common:success"),
                message: t("settings:purchase-successful"),
              });
            } else {
              alertRef.current?.showAlert({
                title: t("common:error"),
                message: t("settings:purchase-failed"),
                variant: "destructive",
              });
            }

            bottomSheetModalRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
    </Background>
  );
}
