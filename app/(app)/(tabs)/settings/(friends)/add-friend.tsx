import { Text } from "@/components/ui/Text";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import tw from "@/lib/tailwind";
import { Background } from "@/components/Background";
import { useSupabase } from "@/context/useSupabase";
import { useAlert } from "@/context/AlertContext";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { ClipboardIcon, UserPlusIcon } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";

export default () => {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [scanned, setScanned] = React.useState(false);
  const { sb } = useSupabase();
  const alertRef = useAlert();
  const { t } = useTranslation();

  const [value, setValue] = React.useState("");

  const cameraRef = React.useRef<Camera>(null);

  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  type Coordinate = {
    x: number;
    y: number;
  };

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

    setScanned(true);
    setValue(data);
    cameraRef.current?.pausePreview();

    addFriend(data);
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
    <Background style={tw`pt-10 px-10`}>
      <View
        style={tw`w-full aspect-1/1 border border-accent border-2 rounded-lg overflow-hidden`}
      >
        {hasPermission ? (
          <View style={tw`relative w-full h-full`}>
            <Camera
              onBarCodeScanned={handleBarCodeScanned}
              ref={cameraRef}
              ratio="1:1"
              style={[
                tw`w-full h-full`,
                {
                  objectFit: "contain",
                },
              ]}
            ></Camera>
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
          <>
            <Text>{t("settings:cameraPermissionNotGranted")}</Text>
            <Button
              label={t("settings:grantCameraPermission")}
              onPress={async () => {
                const barCodePermission =
                  await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(barCodePermission.status === "granted");
              }}
            />
          </>
        )}
      </View>
      <Text style={tw`text-center mt-4 mb-2`}>
        {t("settings:orEnterFriendAddress")}
      </Text>
      <Input
        placeholder={"12345678-abcd-1234-abcd-1234567890ab"}
        value={value}
        onChangeText={setValue}
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
          <ClipboardIcon size={22} color={tw.color("accent")} />
        </TouchableOpacity>
      </View>
    </Background>
  );
};
