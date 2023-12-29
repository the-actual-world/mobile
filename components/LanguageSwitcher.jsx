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

// Language switcher
export default function LanguageSwitcher() {
  const { colorScheme } = useColorScheme();

  const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "pt", name: "Português" },
  ];

  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(async (language) => {
    i18n.changeLanguage(language);
  });

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
        {LANGUAGES.map((language) => (
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
