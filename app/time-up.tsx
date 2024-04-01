import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, BackHandler } from "react-native";
import { useTimer } from "@/context/TimerContext";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Background } from "@/components/Background";
import tw from "@/lib/tailwind";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const TimeUpPage = () => {
  const { t } = useTranslation();

  return (
    <Background
      showScroll={false}
      style={tw`
      flex
      justify-center
      items-center
    `}
    >
      <LanguageSwitcher />

      <View style={tw`h-1`} />

      <Text style={tw`text-2xl font-bold text-center mb-1`}>
        {t("auth:timeUp")}
      </Text>

      <Text
        style={tw`text-center text-sm text-muted-foreground dark:text-dark-muted-foreground`}
      >
        {t("auth:timeUpDescription")}
      </Text>

      <View style={tw`h-5`} />

      <Button
        onPress={() => {
          BackHandler.exitApp();
        }}
        variant="destructive"
        label={t("common:exit")}
      />
    </Background>
  );
};

export default TimeUpPage;
