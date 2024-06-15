import * as React from "react";
import { AppState, KeyboardAvoidingView, View } from "react-native";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Error } from "@/lib/types";
import { Image } from "expo-image";
import { useAlert } from "@/context/AlertProvider";
import Constants from "expo-constants";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { createFieldSchema } from "@/lib/restrictions";
import { useTranslation } from "react-i18next";
import { fonts } from "@/lib/styles";
import { ScrollView } from "react-native-gesture-handler";
import { Platform } from "react-native";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    sb.auth.startAutoRefresh();
  } else {
    sb.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const { signInWithPassword, signInWithIdToken } = useSupabase();
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();

  const FormSchema = z.object({
    email: createFieldSchema(t, "email"),
    password: createFieldSchema(t, "password"),
  });

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/plus.login"],
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      // setTimeout(() => {
      //   router.push("/home");
      // }, 3000);

      await signInWithPassword(data.email, data.password);
    } catch (error: Error | any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:invalidCredentialsOrEmailUnverified"),
      });
    }
  }

  return (
    <SafeAreaView
      style={tw`flex-1 items-center bg-background dark:bg-dark-background p-4 px-6`}
    >
      <ScrollView
        style={tw`w-full`}
        contentContainerStyle={tw`flex-1 justify-center w-full`}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw`flex-1 justify-center w-full`}
        >
          <View style={tw`w-full items-center gap-2 mt-12`}>
            <Image
              style={tw`w-12 h-12 rounded-full`}
              source={require("@/assets/images/logo.png")}
            />
          </View>
          <View style={tw`flex-1 justify-center w-full`}>
            <Text
              style={[
                tw`text-2xl text-foreground dark:text-dark-foreground mb-4`,
                {
                  fontFamily: fonts.inter.medium,
                },
              ]}
            >
              {t("auth:login-to-account")}
            </Text>
            <View style={tw`w-full gap-y-3`}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("auth:email")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      trigger("email");
                      onBlur();
                    }}
                    errors={errors.email?.message}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder={t("auth:password")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      trigger("password");
                      onBlur();
                    }}
                    errors={errors.password?.message}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    secureTextEntry
                  />
                )}
              />
              <Button
                variant="accent"
                label={t("auth:signIn")}
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
              />

              <View style={tw`flex-row items-center`}>
                <View
                  style={tw`flex-1 h-[1px] bg-foreground/60 dark:bg-dark-foreground/60`}
                />
                <View>
                  <Text
                    style={tw`w-14 text-center text-foreground/80 dark:text-dark-foreground/80`}
                  >
                    {t("auth:or")}
                  </Text>
                </View>
                <View
                  style={tw`flex-1 h-[1px] bg-foreground/60 dark:bg-dark-foreground/60`}
                />
              </View>

              <Button
                label={t("auth:signInWithGoogle")}
                icon={
                  <Image
                    style={tw`w-4 h-4 rounded-full`}
                    source={require("@/assets/images/google.png")}
                  />
                }
                variant="outline"
                onPress={async () => {
                  try {
                    await GoogleSignin.hasPlayServices();
                    const userInfo = await GoogleSignin.signIn();
                    console.log(userInfo);
                    console.log(JSON.stringify(userInfo, null, 2));
                    if (!userInfo.idToken) throw new Error("No idToken");

                    const result = await sb.functions.invoke(
                      "does-account-exist",
                      {
                        body: { email: userInfo.user.email },
                      }
                    );
                    if (!JSON.parse(result.data).exists) {
                      alertRef.current?.showAlert({
                        variant: "destructive",
                        title: t("common:error"),
                        message: t("auth:accountDoesNotExist"),
                        duration: 12000,
                      });
                      return;
                    }

                    // setTimeout(() => {
                    //   router.push("/home");
                    // }, 3000);

                    await signInWithIdToken("google", userInfo.idToken);
                  } catch (error: any) {
                    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    } else if (error.code === statusCodes.IN_PROGRESS) {
                    } else if (
                      error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
                    ) {
                    } else {
                      console.log(error);
                      alertRef.current?.showAlert({
                        variant: "destructive",
                        title: t("common:error"),
                        message: error.message,
                      });
                    }
                  }
                }}
              />

              <View
                style={tw`flex-row w-full items-center justify-between -mt-1`}
              >
                <Text
                  style={tw`muted`}
                  onPress={() => {
                    router.push("/forgot-password");
                  }}
                >
                  {t("auth:forgotPassword")}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw`w-full gap-y-4 mb-6`}>
            <Text
              style={tw`muted text-center`}
              onPress={() => {
                router.push("/sign-up");
              }}
            >
              {t("auth:dontHaveAnAccount")}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
