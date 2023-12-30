import { Text } from "@/components/ui/Text";
import { useSupabase } from "@/context/useSupabase";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Dimensions, View, ActivityIndicator } from "react-native";
import tw from "@/lib/tailwind";
import { FlashList } from "@shopify/flash-list";
import { Background } from "@/components/Background";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { Link, Stack } from "expo-router";
import { FriendAddedModal } from "@/components/FriendAddedModal";
import { Button } from "@/components/ui/Button";
import { BadgePlusIcon, RefreshCwIcon, Trash2Icon } from "lucide-react-native";
import { useAlert } from "@/context/AlertContext";

interface FriendAddress {
  id: string;
}

export default () => {
  const { t } = useTranslation();
  const { sb } = useSupabase();

  const [friendAddress, setFriendAddress] = React.useState<
    FriendAddress | undefined
  >(undefined);
  const [isLoadingFriendAddress, setIsLoadingFriendAddress] =
    React.useState(false);

  const [isWorkingOnFriendAddress, setIsWorkingOnFriendAddress] =
    React.useState(false);

  const { colorScheme } = useColorScheme();

  const alertRef = useAlert();

  React.useEffect(() => {
    const getFriendAddresses = async () => {
      setIsLoadingFriendAddress(true);

      // setTimeout(async () => {
      const { data, error } = await sb
        .from("friend_addresses")
        .select("id")
        .eq("active", true)
        .maybeSingle();
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      if (!data) {
        setIsLoadingFriendAddress(false);
        return;
      }
      setFriendAddress(data);
      setIsLoadingFriendAddress(false);
      // }, 1000);
    };
    getFriendAddresses();
  }, []);

  return (
    <Background style={tw`pt-10`}>
      <View style={[{ flex: 1, width: "100%" }, tw`items-center px-8`]}>
        {friendAddress ? (
          <>
            <Text style={tw`h4 mb-2`}>
              {t("settings:yourOwnFriendAddress")}
            </Text>
            <QRCode
              value={friendAddress.id}
              size={Dimensions.get("window").width * 0.8 - 20}
              backgroundColor={tw.color("background")}
              logo={require("@/assets/logo.png") as any}
              logoBackgroundColor="black"
              logoBorderRadius={50}
              enableLinearGradient={true}
              linearGradient={
                [tw.color("dark-background"), tw.color("dark-accent")] as any
              }
              quietZone={10}
            />
            <Text style={tw`h5 my-3`}>
              {t("settings:yourOwnFriendAddress1")}{" "}
              <Text
                style={tw`font-bold text-accent`}
                onPress={async () => {
                  await Clipboard.setStringAsync(friendAddress.id);
                }}
              >
                {t("common:here")}
              </Text>{" "}
              {t("settings:yourOwnFriendAddress2")}
            </Text>

            {/* Regenerate address button */}
            <Button
              label={t("settings:regenerateFriendAddress")}
              icon={<RefreshCwIcon size={20} color="white" />}
              isLoading={isWorkingOnFriendAddress}
              onPress={async () => {
                setIsWorkingOnFriendAddress(true);

                // Change the current friend address to inactive (active = false) and create a new one
                const { error: error1 } = await sb
                  .from("friend_addresses")
                  .update({ active: false })
                  .eq("id", friendAddress.id);
                if (error1) {
                  Alert.alert("Error", "ERRR1" + error1.message);
                  return;
                }

                const { data, error } = await sb
                  .from("friend_addresses")
                  .insert([{}])
                  .select("id")
                  .single();

                if (error) {
                  Alert.alert("Error", error.message);
                  return;
                }

                alertRef.current?.showAlert({
                  title: t("common:success"),
                  message: t("settings:regenerateFriendAddressSuccess"),
                });

                setFriendAddress(data);
                setIsWorkingOnFriendAddress(false);
              }}
            />

            <View style={{ marginTop: 6 }} />

            {/* Delete address button */}
            <Button
              label={t("settings:deleteFriendAddress")}
              variant="destructive"
              icon={<Trash2Icon size={20} color="white" />}
              isLoading={isWorkingOnFriendAddress}
              onPress={async () => {
                setIsWorkingOnFriendAddress(true);

                // Disable the current friend address
                const { error: error1 } = await sb
                  .from("friend_addresses")
                  .update({ active: false })
                  .eq("id", friendAddress.id);
                if (error1) return;

                alertRef.current?.showAlert({
                  title: t("common:success"),
                  message: t("settings:deleteFriendAddressSuccess"),
                });

                setFriendAddress(undefined);
                setIsWorkingOnFriendAddress(false);
              }}
            />

            <Text style={tw`mt-2 px-8 text-center`}>
              {t("settings:existingFriendsNotice")}
            </Text>
          </>
        ) : isLoadingFriendAddress ? (
          <View style={tw`items-center`}>
            <Text style={tw`h3 mb-8`}>{t("common:loading")}</Text>
            <ActivityIndicator size="large" color={tw.color("accent")} />
          </View>
        ) : (
          <>
            <Text style={tw`h4 mb-4`}>{t("settings:noFriendAddress")}</Text>

            <Button
              label={t("settings:generateFriendAddress")}
              icon={<BadgePlusIcon size={20} color="white" />}
              isLoading={isWorkingOnFriendAddress}
              onPress={async () => {
                setIsWorkingOnFriendAddress(true);

                const { data, error } = await sb
                  .from("friend_addresses")
                  .insert([{}])
                  .select("id")
                  .single();

                if (error) {
                  Alert.alert("Error", error.message);
                  return;
                }

                alertRef.current?.showAlert({
                  title: t("common:success"),
                  message: t("settings:generateFriendAddressSuccess"),
                });

                setFriendAddress(data);
                setIsWorkingOnFriendAddress(false);
              }}
            />
          </>
        )}
      </View>
    </Background>
  );
};
