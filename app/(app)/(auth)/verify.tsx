import React from "react";
import { View, StyleSheet } from "react-native";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useTranslation } from "react-i18next";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { Image } from "expo-image";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useAlert } from "@/context/AlertProvider";
import { fonts } from "@/lib/styles";
import { Text } from "@/components/ui/Text";

const CELL_COUNT = 6;

export default function Verify() {
  const { verifyOtp } = useSupabase();
  const { email } = useLocalSearchParams();
  const alertRef = useAlert();

  const { t } = useTranslation();

  const [value, setValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const { colorScheme } = useColorScheme();

  async function handleSubmit() {
    if (value.length < 6)
      return alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:pleaseEnterValidCode"),
      });

    setIsSubmitting(true);
    try {
      await verifyOtp(email as string, value, "signup");
    } catch (error: any) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:invalidCode"),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  React.useEffect(() => {
    alertRef.current?.showAlert({
      variant: "default",
      title: t("auth:verificationRequired"),
      message: t("auth:checkEmailForVerification"),
    });
  }, []);

  return (
    <SafeAreaView
      style={tw`flex-1 items-center bg-background dark:bg-dark-background px-6 py-4`}
    >
      <View style={tw`flex-1 w-full items-center justify-center gap-y-8`}>
        <View style={tw`gap-2`}>
          <Text
            style={[
              tw`text-2xl`,
              {
                fontFamily: fonts.inter.bold,
              },
            ]}
          >
            {t("auth:verification")}
          </Text>

          <Text muted style={tw`text-center text-sm`}>
            {t("auth:enterVerificationCode")}
          </Text>
        </View>

        {colorScheme === "light" ? (
          <Image
            style={tw`w-48 h-48 mx-auto`}
            source={require("@/assets/illustrations/verified.svg")}
          />
        ) : (
          <Image
            style={tw`w-48 h-48 mx-auto`}
            source={require("@/assets/illustrations/verified-dark.svg")}
          />
        )}

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={tw`w-full mx-auto`}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[
                tw`
                w-10 h-10 justify-center items-center mx-1 rounded-md border border-input dark:border-dark-input
              `,
                isFocused && tw`border-primary dark:border-dark-primary`,
              ]}
            >
              <Text
                style={tw`
                text-foreground dark:text-dark-foreground text-2xl
              `}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={tw`h-16 w-full`}>
        <Button
          label={t("auth:verify")}
          variant="accent"
          onPress={handleSubmit}
          isLoading={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}
