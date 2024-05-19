import { getLocales } from "expo-localization";
import tw from "@/lib/tailwind";
import { View, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback } from "react";
import * as Localization from "expo-localization";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { constants } from "@/constants/constants";

export function LanguageSwitcher() {
  const { colorScheme } = useColorScheme();

  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(async (language: string) => {
    i18n.changeLanguage(language);
  }, []);

  return (
    <View style={tw`flex-row items-center justify-center`}>
      <Text style={tw`text-primary dark:text-dark-primary text-base`}>
        {t("auth:language")}
      </Text>
      <Picker
        selectedValue={i18n.language}
        style={tw`w-40 text-primary dark:text-dark-primary`}
        onValueChange={changeLanguage}
        dropdownIconColor={
          colorScheme === "dark"
            ? tw.color("dark-primary")
            : tw.color("primary")
        }
        mode="dropdown"
      >
        {constants.LANGUAGES.map((language) => (
          <Picker.Item
            key={language.code}
            label={language.name}
            value={language.code}
          />
        ))}
      </Picker>
    </View>
  );
}

export function MinimalLanguageSwitcher() {
  const { colorScheme } = useColorScheme();

  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(async (language: string) => {
    i18n.changeLanguage(language);
  }, []);

  return (
    <View style={tw`flex-row items-center justify-center`}>
      <Picker
        selectedValue={i18n.language}
        style={tw`w-39 text-foreground dark:text-dark-foreground p-0 m-0`}
        dropdownIconColor={
          colorScheme === "dark"
            ? tw.color("dark-primary")
            : tw.color("primary")
        }
        onValueChange={changeLanguage}
        mode="dropdown"
      >
        {constants.LANGUAGES.map((language) => (
          <Picker.Item
            key={language.code}
            label={language.name}
            value={language.code}
          />
        ))}
      </Picker>
    </View>
  );
}
