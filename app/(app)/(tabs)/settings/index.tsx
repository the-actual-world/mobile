import { Text } from "@/components/ui/Text";
import {
  Alert,
  Linking,
  Pressable,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { getAppIcon, setAppIcon } from "expo-dynamic-app-icon";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import {
  LanguageSwitcher,
  MinimalLanguageSwitcher,
} from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { Image } from "expo-image";
import { useAlert } from "@/context/AlertProvider";
import { Input } from "@/components/ui/Input";
import AvatarEdit from "@/components/EditAvatar";
import RNRestart from "react-native-restart";
import {
  AreaChartIcon,
  BombIcon,
  ChevronRightIcon,
  CodeIcon,
  CoinsIcon,
  FlagIcon,
  GlobeIcon,
  InfoIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  MailsIcon,
  MoonIcon,
  Settings2Icon,
  TrashIcon,
  UsersIcon,
} from "lucide-react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import ChangePasswordModalContent from "@/components/modal-content/ChangePassword";
import { StyleSheet } from "react-native";
import { constants } from "@/constants/constants";
import { fonts } from "@/lib/styles";
import DeleteAccountModalContent from "@/components/modal-content/DeleteAccount";
import { Tables } from "@/supabase/functions/_shared/supabase";

function Divider({ text }: { text: string }) {
  return (
    <Text
      style={[
        tw`text-mt-fg text-xs uppercase tracking-wider mt-4 mb-3`,
        {
          fontFamily: fonts.inter.semiBold,
        },
      ]}
    >
      {text}
    </Text>
  );
}

function SettingItem({
  title,
  color,
  icon,
  onPress,
  rightItem,
}: {
  title: string;
  color?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  rightItem?: React.ReactNode;
}) {
  const { colorScheme } = useColorScheme();

  if (!onPress && rightItem) {
    return (
      <View
        style={tw`flex-row items-center justify-between py-2 px-3 bg-mt rounded-lg mb-2`}
      >
        <View style={tw`flex-row gap-3 items-center`}>
          <View
            style={[
              tw`w-8 h-8 items-center justify-center rounded-full overflow-hidden`,
              { backgroundColor: color },
            ]}
          >
            {icon}
          </View>
          <Text
            style={[
              {
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            {title}
          </Text>
        </View>
        {rightItem}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={tw`flex-row items-center justify-between py-2 px-3 bg-mt rounded-lg mb-2`}
      onPress={onPress}
    >
      <View style={tw`flex-row gap-3 items-center`}>
        <View
          style={[
            tw`w-8 h-8 items-center justify-center rounded-full`,
            { backgroundColor: color },
          ]}
        >
          {icon}
        </View>
        <Text
          style={[
            {
              fontFamily: fonts.inter.medium,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <ChevronRightIcon
        size={20}
        color={
          colorScheme === "dark"
            ? tw.color("dark-foreground/20")
            : tw.color("foreground/20")
        }
      />
    </TouchableOpacity>
  );
}

export default function () {
  const { signOut, user } = useSupabase();
  const { t } = useTranslation();
  const router = useRouter();
  const alertRef = useAlert();

  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");

  const ICONS = [
    {
      slug: "default_",
      name: t("icons:default"),
      icon: require("@/assets/images/icon.png"),
    },
    {
      slug: "light",
      name: t("icons:light"),
      icon: require("@/assets/images/icon-light.png"),
    },
  ];

  const { colorScheme, changeColorScheme } = useColorScheme();

  const [currentAppIcon, setCurrentAppIcon] = React.useState("default_");

  React.useEffect(() => {
    (async () => {
      const icon = await getAppIcon();
      console.log(icon);
      setCurrentAppIcon(icon != "DEFAULT" ? icon : "default_");
    })();
  });

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["50%"], []);
  const [toggledModal, setToggledModal] = React.useState<
    "password_change" | "email_change" | "delete_account"
  >("password_change");
  const handlePresentPasswordChangeModalPress = React.useCallback(() => {
    setToggledModal("password_change");
    bottomSheetModalRef.current?.present();
  }, []);
  const handlePresentEmailChangeModalPress = React.useCallback(() => {
    setToggledModal("email_change");
    bottomSheetModalRef.current?.present();
  }, []);
  const handlePresentDeleteAccountModalPress = React.useCallback(() => {
    setToggledModal("delete_account");
    bottomSheetModalRef.current?.present();
  }, []);

  const setIcon = async (icon: string) => {
    await setAppIcon(icon);
    setCurrentAppIcon(icon);
  };

  React.useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  async function updateProfile({ name }: { name: string }) {
    try {
      setLoading(true);

      const updates = {
        name: name,
        updated_at: new Date().toISOString(),
      };
      const { error, status, statusText } = await sb
        .from("users")
        .update(updates)
        .eq("id", user?.id ?? "");

      if (error) {
        throw error;
      }

      alertRef.current?.showAlert({
        title: t("common:success"),
        message: t("profile:profileUpdated"),
        variant: "default",
      });
    } catch (error) {
      if (error instanceof Error) {
        alertRef.current?.showAlert({
          title: t("common:error"),
          message: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={toggledModal === "password_change" ? ["50%"] : ["60%"]}
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
        {toggledModal === "password_change" ? (
          <ChangePasswordModalContent
            onClose={() => bottomSheetModalRef.current?.dismiss()}
          />
        ) : toggledModal === "delete_account" ? (
          <DeleteAccountModalContent
            onClose={() => bottomSheetModalRef.current?.dismiss()}
            signOut={signOut}
            user={user as Tables<"users">}
          />
        ) : null}
      </BottomSheetModal>

      <View style={tw`items-center mb-3`}>
        <AvatarEdit
          size={80}
          onUpload={async (url: string) => {
            updateProfile({
              name: name,
            });
            console.log("Avatar uploaded: ", url);
          }}
        />
        <TextInput
          style={[
            tw`text-mt-fg text-lg mt-1`,
            { fontFamily: fonts.inter.semiBold },
          ]}
          placeholder={t("auth:name")}
          value={name || ""}
          onChangeText={(text) => setName(text)}
          onEndEditing={() => {
            updateProfile({
              name: name,
            });
          }}
        />
        <Text style={[tw`text-mt-fg text-xs mt-1`]}>{user?.email}</Text>
      </View>

      <Divider text={t("settings:preferences")} />
      <SettingItem
        title={t("settings:darkMode")}
        color="#3474cc"
        icon={<MoonIcon size={20} color={tw.color("background")} />}
        rightItem={
          <Switch
            value={colorScheme === "dark"}
            onValueChange={() => {
              Alert.alert(
                t("settings:restartApp"),
                t("settings:restartAppForChangesToTakeEffect"),
                [
                  {
                    text: t("common:cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("common:ok"),
                    onPress: () => {
                      // setColorScheme(colorScheme === "dark" ? "light" : "dark");
                      changeColorScheme(undefined);
                      RNRestart.Restart();
                    },
                  },
                ]
              );
            }}
          />
        }
      />
      <SettingItem
        title={t("settings:language")}
        color="#fd8804"
        icon={<GlobeIcon size={20} color={tw.color("background")} />}
        rightItem={<MinimalLanguageSwitcher />}
      />
      <SettingItem
        title={t("settings:icon")}
        color="#f4b400"
        icon={
          <Image
            style={tw`w-8 h-8 rounded-md`}
            source={ICONS.find((icon) => icon.slug === currentAppIcon)?.icon}
          />
        }
        rightItem={
          <View style={tw`flex-row gap-2`}>
            {ICONS.map((icon) => (
              <Pressable
                key={icon.slug}
                style={tw`items-center`}
                onPress={() => setIcon(icon.slug)}
              >
                <Image
                  style={tw`w-12 h-12 rounded-md
                ${
                  currentAppIcon === icon.slug
                    ? "border-2 border-orange-400"
                    : ""
                }
                `}
                  source={icon.icon}
                />
              </Pressable>
            ))}
          </View>
        }
      />
      <SettingItem
        title={t("settings:extras")}
        color="#ff5722"
        icon={<Settings2Icon size={20} color={tw.color("background")} />}
        onPress={() => router.push("/settings/extras")}
      />
      <Divider text={t("settings:account")} />
      <SettingItem
        title={t("settings:manageCredits")}
        color="#9c27b0"
        icon={<CoinsIcon size={20} color={tw.color("background")} />}
        onPress={() => router.push("/settings/manage-credits")}
      />
      <SettingItem
        title={t("settings:manageFriends")}
        color="#03a9f4"
        icon={<UsersIcon size={20} color={tw.color("background")} />}
        onPress={() => router.push("/settings/manage-friends")}
      />
      <Divider text={t("settings:security")} />
      <SettingItem
        title={t("settings:changePassword")}
        color="#ff9800"
        icon={<KeyRoundIcon size={20} color={tw.color("background")} />}
        onPress={() => handlePresentPasswordChangeModalPress()}
      />
      <SettingItem
        title={t("settings:changeEmail")}
        color="#e91e63"
        icon={<MailIcon size={20} color={tw.color("background")} />}
        onPress={() => {
          router.push("/settings/change-email");
        }}
      />
      <SettingItem
        title={t("settings:signOut")}
        color="#f44336"
        icon={<LogOutIcon size={20} color={tw.color("background")} />}
        onPress={async () => {
          await signOut();
        }}
      />
      <Divider text={t("settings:others")} />
      <SettingItem
        title={t("settings:statistics")}
        color="#4caf50"
        icon={<AreaChartIcon size={20} color={tw.color("background")} />}
        onPress={() => router.push("/settings/statistics")}
      />
      <Divider text={t("settings:help")} />
      <SettingItem
        title={t("settings:reportIssue")}
        color="#ff5722"
        icon={<FlagIcon size={20} color={tw.color("background")} />}
        onPress={() =>
          Linking.openURL(
            "https://github.com/the-actual-world/mobile/issues/new"
          )
        }
      />
      <SettingItem
        title={t("settings:contactUs")}
        color="#03a9f4"
        icon={<MailsIcon size={20} color={tw.color("background")} />}
        onPress={() => Linking.openURL("mailto:help@kraktoos.com")}
      />
      <SettingItem
        title={t("settings:faq")}
        color="#4caf50"
        icon={<InfoIcon size={20} color={tw.color("background")} />}
        onPress={() => Linking.openURL(`${constants.WEBSITE_URL}/help`)}
      />
      <SettingItem
        title={t("settings:sourceCode")}
        color="#9c27b0"
        icon={<CodeIcon size={20} color={tw.color("background")} />}
        onPress={() =>
          Linking.openURL("https://github.com/the-actual-world/mobile")
        }
      />
      <Divider text={t("settings:dangerZone")} />
      <SettingItem
        title={t("settings:deleteAccount")}
        color="#f44336"
        icon={<TrashIcon size={20} color={tw.color("background")} />}
        onPress={handlePresentDeleteAccountModalPress}
      />
    </Background>
  );
}
