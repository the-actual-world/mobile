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
  UsersIcon,
} from "lucide-react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import ChangePasswordModalContent from "@/components/modal-content/ChangePassword";
import { StyleSheet } from "react-native";
import { constants } from "@/constants/constants";
import { useSettings } from "@/context/SettingsProvider";

function Divider({ text }: { text: string }) {
  return (
    <Text
      style={[
        tw`text-mt-fg text-xs uppercase tracking-wider mt-4 mb-3`,
        {
          fontFamily: "Inter_600SemiBold",
        },
      ]}
    >
      {text}
    </Text>
  );
}

function SettingItem({
  title,
  onPress,
  rightItem,
}: {
  title: string;
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
  const { t } = useTranslation();
  const router = useRouter();
  const alertRef = useAlert();

  const { colorScheme, changeColorScheme } = useColorScheme();
  const { settings, setSetting, toggleSetting } = useSettings();

  return (
    <Background>
      <Divider text={t("settings:timeline")} />
      <SettingItem
        title={t("settings:snapToPosts")}
        rightItem={
          <Switch
            value={settings.timeline.snapToPosts}
            onValueChange={() => {
              toggleSetting("timeline", "snapToPosts");
            }}
          />
        }
      />
      <SettingItem
        title={t("settings:showScrollToTopButton")}
        rightItem={
          <Switch
            value={settings.timeline.showScrollToTopButton}
            onValueChange={() => {
              toggleSetting("timeline", "showScrollToTopButton");
            }}
          />
        }
      />
      <SettingItem
        title={t("settings:showUpAndDownButtons")}
        rightItem={
          <Switch
            value={settings.timeline.showUpAndDownButtons}
            onValueChange={() => {
              toggleSetting("timeline", "showUpAndDownButtons");
            }}
          />
        }
      />

      <Divider text={t("settings:others")} />
      <SettingItem
        title={t("settings:showRelativeTime")}
        rightItem={
          <Switch
            value={settings.others.showRelativeTime}
            onValueChange={() => {
              toggleSetting("others", "showRelativeTime");
            }}
          />
        }
      />
      <SettingItem
        title={t("settings:previewLinks")}
        rightItem={
          <Switch
            value={settings.others.previewLinks}
            onValueChange={() => {
              toggleSetting("others", "previewLinks");
            }}
          />
        }
      />
    </Background>
  );
}
