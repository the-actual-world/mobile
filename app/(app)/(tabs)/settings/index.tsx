import { Text } from "@/components/ui/Text";
import { Pressable, View } from "react-native";
import React from "react";

import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "expo-router";
import { Background } from "@/components/Background";

export default function Index() {
  const { signOut } = useSupabase();
  const { t } = useTranslation();
  const router = useRouter();

  const { colorScheme, toggleColorScheme, setColorScheme, changeColorScheme } =
    useColorScheme();

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
      {/* divider */}
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
