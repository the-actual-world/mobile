import React from "react";
import { View, StyleSheet } from "react-native";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Background } from "@/components/Background";
import { fonts } from "@/lib/styles";
import { Text } from "@/components/ui/Text";
import { createFieldSchema } from "@/lib/restrictions";

const CELL_COUNT = 6;

export default function Verify() {
  const { verifyOtp } = useSupabase();
  const alertRef = useAlert();

  const { t } = useTranslation();

  const [newEmail, setNewEmail] = React.useState("");
  const [oldEmailCode, setOldEmailCode] = React.useState("");
  const [newEmailCode, setNewEmailCode] = React.useState("");
  const [isEmailChangeSubmitting, setIsEmailChangeSubmitting] =
    React.useState(false);
  const [isEmailVerifySubmitting, setIsEmailVerifySubmitting] =
    React.useState(false);
  const [isOldEmailCodeVerified, setIsOldEmailCodeVerified] =
    React.useState(false);
  const ref = useBlurOnFulfill({ value: oldEmailCode, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: oldEmailCode,
    setValue: setOldEmailCode,
  });
  const [props2, getCellOnLayoutHandler2] = useClearByFocusCell({
    value: newEmailCode,
    setValue: setNewEmailCode,
  });
  const [isEmailInserted, setIsEmailInserted] = React.useState(false);

  const [lastCodeSendRequest, setLastCodeSendRequest] = React.useState<Date>(
    new Date()
  );

  const router = useRouter();
  const { session } = useSupabase();

  async function handleEmailSubmit() {
    setIsEmailChangeSubmitting(true);
    setIsEmailInserted(true);

    alertRef.current?.showAlert({
      variant: "default",
      title: t("common:success"),
      message: t("auth:email-code-sent"),
      duration: 10000,
    });

    setLastCodeSendRequest(new Date());

    const { error } = await sb.auth.updateUser({ email: newEmail });

    if (error) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:email-change-failed"),
      });

      router.back();
    }

    setIsEmailChangeSubmitting(false);
    setIsEmailVerifySubmitting(false);
    router.back();
    return;
  }

  async function handleResendRequest() {
    setIsEmailChangeSubmitting(true);
    setIsEmailInserted(true);

    alertRef.current?.showAlert({
      variant: "default",
      title: t("common:success"),
      message: t("auth:email-code-sent"),
      duration: 10000,
    });

    setLastCodeSendRequest(new Date());

    await sb.auth.resend({
      email: newEmail,
      type: "email_change",
    });

    setIsEmailChangeSubmitting(false);
    setIsEmailVerifySubmitting(false);
    return;
  }

  async function handleVerifySubmit() {
    if (
      (!isOldEmailCodeVerified && oldEmailCode.length < 6) ||
      (isOldEmailCodeVerified && newEmailCode.length < 6)
    )
      return alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:pleaseEnterValidCodes"),
      });

    setIsEmailVerifySubmitting(true);
    try {
      if (!isOldEmailCodeVerified) {
        await verifyOtp(
          session?.user.email as string,
          oldEmailCode,
          "email_change"
        );

        setIsOldEmailCodeVerified(true);

        alertRef.current?.showAlert({
          variant: "default",
          title: t("common:success"),
          message: t("auth:oldEmailVerified"),
        });

        setIsEmailVerifySubmitting(false);
        return;
      }
      await verifyOtp(newEmail, newEmailCode, "email_change");

      setIsOldEmailCodeVerified(true);

      alertRef.current?.showAlert({
        variant: "default",
        title: t("common:success"),
        message: t("auth:emailChangeSuccess"),
      });

      setIsEmailVerifySubmitting(false);
    } catch (error: any) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:invalidCode"),
      });
      setIsEmailVerifySubmitting(false);
      router.back();
    }
  }

  const [secondsLeftToResend, setSecondsLeftToResend] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (new Date().getTime() - lastCodeSendRequest.getTime() < 30000) {
        setSecondsLeftToResend(
          Math.ceil(
            (30000 - (new Date().getTime() - lastCodeSendRequest.getTime())) /
              1000
          )
        );
      } else {
        setSecondsLeftToResend(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCodeSendRequest]);

  return (
    <Background>
      <View style={tw`gap-4`}>
        <Text
          style={[
            tw`text-2xl text-foreground dark:text-dark-foreground mb-4`,
            {
              fontFamily: fonts.inter.medium,
            },
          ]}
        >
          {t("settings:changeEmail")}
        </Text>

        <Input
          label={t("settings:current-email")}
          value={session?.user.email as string}
          disabled
        />

        <Input
          label={t("settings:new-email")}
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          disabled={isEmailInserted}
        />

        {isEmailInserted && (
          <View style={tw`w-full gap-4`}>
            {!isOldEmailCodeVerified ? (
              <View style={tw`gap-2`}>
                <View>
                  <Text>{t("auth:insert-current-email-code")}</Text>
                  <Text muted style={tw`text-xs`}>
                    {session?.user.email}
                  </Text>
                </View>
                <CodeField
                  ref={ref}
                  {...props}
                  value={oldEmailCode}
                  onChangeText={setOldEmailCode}
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
                        isFocused &&
                          tw`border-primary dark:border-dark-primary`,
                        isOldEmailCodeVerified && tw`muted`,
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
            ) : (
              <View style={tw`gap-2`}>
                <View>
                  <Text>{t("auth:insert-new-email-code")}</Text>
                  <Text muted style={tw`text-xs`}>
                    {newEmail}
                  </Text>
                </View>
                <CodeField
                  ref={ref}
                  {...props2}
                  value={newEmailCode}
                  onChangeText={setNewEmailCode}
                  cellCount={CELL_COUNT}
                  rootStyle={tw`w-full mx-auto`}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <View
                      // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                      onLayout={getCellOnLayoutHandler2(index)}
                      key={index}
                      style={[
                        tw`
                w-10 h-10 justify-center items-center mx-1 rounded-md border border-input dark:border-dark-input
              `,
                        isFocused &&
                          tw`border-primary dark:border-dark-primary`,
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
            )}
          </View>
        )}

        {isEmailInserted && (
          <>
            <Button
              label={
                t("auth:resend-code") +
                (secondsLeftToResend > 0 ? ` (${secondsLeftToResend})` : "")
              }
              variant="outline"
              onPress={handleResendRequest}
              isLoading={isEmailVerifySubmitting}
              disabled={secondsLeftToResend > 0}
            />
            <Button
              label={
                !isOldEmailCodeVerified
                  ? t("auth:verify-old-email")
                  : t("auth:verify-new-email")
              }
              variant="accent"
              onPress={handleVerifySubmit}
              isLoading={isEmailVerifySubmitting}
              disabled={
                !isOldEmailCodeVerified
                  ? oldEmailCode.length < 6
                  : newEmailCode.length < 6
              }
            />
          </>
        )}

        <Button
          label={t("settings:changeEmail")}
          variant="accent"
          onPress={handleEmailSubmit}
          isLoading={isEmailChangeSubmitting}
          disabled={
            createFieldSchema(t, "email").safeParse(newEmail).success === false
          }
        />
      </View>
    </Background>
  );
}
