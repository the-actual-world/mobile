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
import { fonts } from "@/lib/styles";

function CoolPlus() {
  return (
    <Text
      style={[
        tw`my-1 text-primary dark:text-dark-primary text-3xl text-center`,
        {
          fontFamily: fonts.inter.bold,
        },
      ]}
    >
      +
    </Text>
  );
}

export default () => {
  const alertRef = useAlert();
  const { t } = useTranslation();

  return (
    <Background>
      <Text style={tw`mb-2 text-mt-fg`}>{t("credits:desc1")}</Text>
      <Text
        style={tw`mb-2 text-lg bg-bd text-primary dark:text-dark-primary p-2 rounded-lg`}
      >
        {t("credits:desc2")}
      </Text>
      <Text style={tw`mb-2`}>{t("credits:desc3")}</Text>
      <Text style={tw`mb-2`}>{t("credits:desc4")}</Text>
      <Text style={tw`mb-2`}>
        {t("credits:desc5")}{" "}
        <Text
          style={{
            fontFamily: fonts.inter.bold,
          }}
        >
          {t("credits:desc6")}
        </Text>
      </Text>
      <Text style={tw`mb-2`}>{t("credits:desc7")}</Text>
      <Text style={tw`mb-2`}>{t("credits:desc8")}</Text>
      <Text style={tw`mt-2`}>{t("credits:desc9")}</Text>

      <View style={tw`mt-4 px-4 py-3 bg-bd rounded-lg gap-2`}>
        {[
          t("credits:criteria1"),
          t("credits:criteria2"),
          t("credits:criteria3"),
        ].map((criteria, index) => (
          <View key={index}>
            {index > 0 && <CoolPlus />}
            <Text
              style={{
                fontFamily: fonts.inter.semiBold,
              }}
            >
              {criteria}
            </Text>
          </View>
        ))}
      </View>
    </Background>
  );
};
