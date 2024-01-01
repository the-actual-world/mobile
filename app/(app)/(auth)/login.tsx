import * as React from "react";
import { View } from "react-native";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Error } from "@/types/error";
import { Image } from "expo-image";
import { t } from "i18next";
import { useAlert } from "@/context/AlertContext";
import Constants from "expo-constants";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const FormSchema = z.object({
  email: z
    .string({
      required_error: t("auth:fieldRequired"),
    })
    .email(t("auth:invalidEmail")),
  password: z
    .string({
      required_error: t("auth:fieldRequired"),
    })
    .min(8, t("auth:passwordMin"))
    .max(128, t("auth:passwordMax")),
});

export default function Login() {
  const { signInWithPassword, signInWithIdToken } = useSupabase();
  const router = useRouter();
  const alertRef = useAlert();

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
    webClientId:
      "234450083756-kun0erpoagge7k44j6io3v0bsorrul85.apps.googleusercontent.com",
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await signInWithPassword(data.email, data.password);
    } catch (error: Error | any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common.error"),
        message: error.message,
      });
    }
  }

  return (
    <SafeAreaView
      style={tw`flex-1 items-center bg-background dark:bg-dark-background p-4`}
    >
      <View style={tw`flex-1 justify-center w-full`}>
        <View style={tw`w-full items-center`}>
          <Image
            style={tw`w-12 h-12 rounded-full mb-5`}
            source={require("@/assets/logo.png")}
          />
        </View>
        <View style={tw`w-full gap-y-4`}>
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
                source={require("@/assets/google.png")}
              />
            }
            variant="outline"
            onPress={async () => {
              try {
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                console.log(JSON.stringify(userInfo, null, 2));
                if (!userInfo.idToken) throw new Error("No idToken");
                await signInWithIdToken("google", userInfo.idToken);
              } catch (error: any) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                } else if (error.code === statusCodes.IN_PROGRESS) {
                } else if (
                  error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
                ) {
                } else {
                }
              }
            }}
          />
        </View>
      </View>
      <View style={tw`w-full gap-y-4 mb-6`}>
        <Text
          style={tw`muted text-center`}
          onPress={() => {
            router.back();
          }}
        >
          {t("auth:dontHaveAnAccount")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
