import { Text } from "@/components/ui/Text";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/Button";
import tw from "@/lib/tailwind";
import { Background } from "@/components/Background";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { useAlert } from "@/context/AlertProvider";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { ClipboardIcon, TrashIcon, UserPlusIcon } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { Camera } from "expo-camera";
import React from "react";
import { useIsFocused } from "@react-navigation/native";

export default () => {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [scanned, setScanned] = React.useState(false);
  const alertRef = useAlert();
  const { t } = useTranslation();

  const [value, setValue] = React.useState("");

  const cameraRef = React.useRef<Camera>(null);

  const isFocused = useIsFocused();

  React.useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  function verifyValidFriendAddress(friendAddress: string): boolean {
    // check if friendAddress is valid uuid
    const isUUID = friendAddress.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    return isUUID !== null;
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!verifyValidFriendAddress(data)) {
      return;
    }

    // addFriend(data);
    setValue(data);
    setScanned(true);
    cameraRef.current?.pausePreview();
  };

  async function addFriend(friendAddress: string) {
    if (!verifyValidFriendAddress(friendAddress)) {
      alertRef.current?.showAlert({
        title: t("common:error"),
        message: t("settings:invalidFriendAddress"),
        variant: "destructive",
      });
      return;
    }

    const { data: success, error } = await sb.rpc("invite_friend_by_address", {
      target_friend_address: friendAddress,
    });

    if (error) {
      alertRef.current?.showAlert({
        title: t("common:error"),
        message: t("settings:alreadyFriends"),
        variant: "destructive",
      });
      return;
    }

    console.log(JSON.stringify(success));

    if (success) {
      alertRef.current?.showAlert({
        title: t("common:success"),
        message: t("settings:friendInvitedSuccessfully"),
      });
    } else {
      alertRef.current?.showAlert({
        title: t("common:error"),
        message: t("settings:friendInvitationFailed"),
        variant: "destructive",
      });
    }
  }

  return (
    <Background style={tw`px-6`}>
      <View style={tw`flex-1 items-center`}>
        <View
          style={tw`w-full aspect-3/4 border border-accent border-2 rounded-lg overflow-hidden`}
        >
          {hasPermission ? (
            <View style={tw`relative w-full h-full`}>
              {isFocused && (
                <Camera
                  onBarCodeScanned={handleBarCodeScanned}
                  ref={cameraRef}
                  ratio="3:4"
                  style={[
                    tw`w-full h-full`,
                    {
                      objectFit: "contain",
                    },
                  ]}
                ></Camera>
              )}
              {scanned && (
                <View
                  style={tw`absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-dark-background/70 z-10`}
                >
                  <View style={tw`flex-1 justify-center items-center px-5`}>
                    <Text style={tw`text-center text-white text-lg mt-4 mb-2`}>
                      {t("settings:friendAddressScanned")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        cameraRef.current?.resumePreview();
                        setScanned(false);
                      }}
                    >
                      <Text
                        style={tw`text-center bg-white rounded-lg px-4 py-2 text-foreground dark:text-foreground`}
                      >
                        {t("settings:tapToScanAgain")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={tw`flex-1 justify-center items-center px-5 gap-2`}>
              <Text>{t("settings:cameraPermissionNotGranted")}</Text>
              <Button
                label={t("settings:grantCameraPermission")}
                onPress={async () => {
                  const barCodePermission =
                    await Camera.requestCameraPermissionsAsync();
                  setHasPermission(barCodePermission.status === "granted");
                }}
              />
            </View>
          )}
        </View>
        <Text style={tw`text-center mt-4 mb-2`}>
          {t("settings:orEnterFriendAddress")}
        </Text>
        <Input
          secureTextEntry={true}
          placeholder={"********-****-****-****-************"}
          value={value}
          onChangeText={setValue}
          style={tw`w-full`}
        />
        <View style={tw`mb-4`} />
        <View style={tw`flex-row gap-3 items-center`}>
          <Button
            label={t("settings:addFriend")}
            onPress={() => {
              addFriend(value);
            }}
            icon={<UserPlusIcon size={20} color="white" />}
          />
          <TouchableOpacity
            onPress={async () => {
              setValue(await Clipboard.getStringAsync());
            }}
          >
            <ClipboardIcon size={25} color={tw.color("accent")} />
          </TouchableOpacity>
          {/* clear icon */}
          <TouchableOpacity
            onPress={() => {
              setValue("");
            }}
          >
            <TrashIcon size={25} color={tw.color("destructive")} />
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};
