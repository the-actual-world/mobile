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
  ArrowDownIcon,
  ArrowUpIcon,
  BotIcon,
  CameraIcon,
  CoinsIcon,
  GemIcon,
  GiftIcon,
  QrCodeIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
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
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const alertRef = useAlert();
  const { credits, loadMore, totalCredits } = useCredits();
  const { getFriendById } = useFriends();
  const timeAgo = useTimeAgo();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["50%"], []);

  const SYSTEM_USERS = ["SYSTEM", "NEW_ACCOUNT", "GIFT"];
  const PRICE_PER_CREDIT = 0.01;
  const PRESET_CREDIT_OFFERS = [10000, 50000, 100000];
  const [creditsToBuy, setCreditsToBuy] = React.useState<number>(0);

  return (
    <Background showScroll={false}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`px-4 py-3 bg-mt rounded-lg`}>
          <Text style={tw`text-mt-fg`}>{t("settings:totalCredits")}</Text>
          <Text style={tw`text-3xl`}>
            {totalCredits}{" "}
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

        <Button
          onPress={() => bottomSheetModalRef.current?.present()}
          label={t("settings:buyCredits")}
          icon={<ShoppingBagIcon size={24} color="white" />}
        />
      </View>

      <FlatList
        data={credits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`gap-2`}
        renderItem={({ item }) => (
          <View style={tw`flex-row items-center justify-between`}>
            {/* <View style={tw`flex-row items-center gap-2`}>
              {item.amount > 0 ? (
                <ArrowUpIcon size={24} color={tw.color("primary")} />
              ) : (
                <ArrowDownIcon size={24} color={tw.color("destructive")} />
              )}
              <Text>
                {item.amount > 0 ? "+" : ""}
                {item.amount}
              </Text>
            </View> */}
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
                ) : item.sender === "GIFT" ? (
                  <GiftIcon
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
                    : item.sender === "GIFT"
                    ? t("common:unknown")
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
              {item.amount > 0 ? (
                <ArrowUpIcon size={24} color={tw.color("primary")} />
              ) : (
                <ArrowDownIcon size={24} color={tw.color("destructive")} />
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
        backgroundStyle={tw`bg-background dark:bg-dark-background`}
        handleIndicatorStyle={tw`bg-muted-foreground dark:bg-dark-muted-foreground`}
        style={tw`px-6 py-4`}
      >
        <Text style={tw`text-xl font-bold mb-2`}>
          {t("settings:buyCredits")}
        </Text>
        <Text style={tw`text-mt-fg mb-4`}>
          {t("settings:buyCreditsDescription")}
        </Text>

        <View style={tw`flex-row gap-4 items-center justify-center`}>
          {PRESET_CREDIT_OFFERS.map((credits) => (
            <Button
              key={credits}
              label={credits.toString()}
              onPress={() => setCreditsToBuy(credits)}
            />
          ))}
        </View>

        <View style={tw`flex-row items-center justify-center mt-4`}>
          <Text style={tw`text-xl font-bold`}>
            {creditsToBuy}{" "}
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

        <Button
          label={t("settings:purchase")}
          onPress={async () => {
            bottomSheetModalRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
    </Background>
  );
}
