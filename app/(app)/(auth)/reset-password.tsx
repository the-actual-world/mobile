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
import { Error } from "@/lib/types";
import { Image } from "expo-image";
import { useAlert } from "@/context/AlertContext";
import { createFieldSchema } from "@/lib/restrictions";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";

export default function () {
  const router = useRouter();
  const alertRef = useAlert();
  const { sb, session } = useSupabase();
  const { t } = useTranslation();
  const FormSchema = z
    .object({
      password: createFieldSchema(t, "password"),
      confirmPassword: createFieldSchema(t, "confirmPassword"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth:passwordNotMatch"),
      path: ["confirmPassword"],
    });

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await sb.auth.updateUser({
        password: data.password,
      });

      alertRef.current?.showAlert({
        variant: "default",
        message: t("auth:passwordResetted"),
      });

      router.replace("/login");
    } catch (error: Error | any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
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
            source={require("@/assets/images/logo.png")}
          />
        </View>
        <View style={tw`w-full gap-y-2`}>
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
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("auth:confirmPassword")}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("confirmPassword");
                  onBlur();
                }}
                errors={errors.confirmPassword?.message}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry
              />
            )}
          />
          <Button
            variant="accent"
            label={t("auth:submit")}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
