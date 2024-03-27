import { Text } from "@/components/ui/Text";
import { Pressable, View } from "react-native";
import React from "react";
import { getAppIcon, setAppIcon } from "expo-dynamic-app-icon";
import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "expo-router";
import { Background } from "@/components/Background";
import { Image } from "expo-image";

export default function Index() {
  const { signOut } = useSupabase();
  const { t } = useTranslation();
  const router = useRouter();

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

  const { colorScheme, toggleColorScheme, setColorScheme, changeColorScheme } =
    useColorScheme();

  const [currentAppIcon, setCurrentAppIcon] = React.useState("Default");

  React.useEffect(() => {
    (async () => {
      const icon = await getAppIcon();
      setCurrentAppIcon(icon);
    })();
  });

  const setIcon = async (icon: string) => {
    await setAppIcon(icon);
    setCurrentAppIcon(icon);
  };

  return (
    <Background style={tw`px-5`}>
      <Text
        style={tw`
        text-3xl
      `}
      >
        {t("onboarding:chooseLanguage")}
      </Text>
      <View style={tw`flex-row mt-2`}>
        <LanguageSwitcher />
      </View>
      {/* divider */}
      <View
        style={tw`
        w-full
        h-px
        bg-accent
        my-8
      `}
      />
      <Text
        style={tw`
        text-3xl
      `}
      >
        {t("onboarding:chooseColorScheme")}
      </Text>
      <View style={tw`flex-row mt-6 gap-4`}>
        <Pressable
          style={tw`px-6 py-3 bg-[#ffffff] rounded-md border-2 border-accent shadow-lg shadow-accent`}
          onPress={() => {
            changeColorScheme("light");
          }}
        >
          <Text style={tw`text-black`}>{t("common:light")}</Text>
        </Pressable>

        <Pressable
          style={tw`px-6 py-3 bg-[#000000] rounded-md border-2 border-accent shadow-lg shadow-accent`}
          onPress={() => {
            changeColorScheme("dark");
          }}
        >
          <Text style={tw`text-white`}>{t("common:dark")}</Text>
        </Pressable>
      </View>

      <View style={tw`flex-row mt-6 gap-4`}>
        {ICONS.map((icon) => (
          <Pressable
            key={icon.slug}
            style={tw`rounded-md p-2`}
            onPress={() => setIcon(icon.slug)}
          >
            <View
              style={tw`
              w-16
              h-16
              rounded-md
              bg-foreground
              items-center
              justify-center
            `}
            >
              <Image
                style={tw`w-12 h-12`}
                source={icon.icon}
                contentFit="contain"
              />
            </View>
            <Text
              style={tw`
              text-center
              mt-2
              ${
                currentAppIcon === icon.slug ? "text-accent" : "text-foreground"
              }
            `}
            >
              {icon.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={tw`
        w-full
        h-px
        bg-accent
        my-8
      `}
      />
      <View style={tw`w-full gap-y-3`}>
        <Link
          href="/settings/manage-friends"
          style={tw`text-accent text-center py-2`}
        >
          {t("settings:manageFriends")}
        </Link>
        <Button
          variant="destructive"
          onPress={() => signOut()}
          label={t("auth:signOut")}
        />
      </View>
    </Background>
  );
}
