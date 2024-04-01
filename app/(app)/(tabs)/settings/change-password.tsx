import * as React from "react";
import { View } from "react-native";
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
import { createFieldSchema } from "@/lib/restrictions";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Background } from "@/components/Background";

export default function () {
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();
  const FormSchema = z
    .object({
      oldPassword: createFieldSchema(t, "password"),
      newPassword: createFieldSchema(t, "password"),
      confirmNewPassword: createFieldSchema(t, "confirmPassword"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("auth:passwordNotMatch"),
      path: ["confirmNewPassword"],
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
      const { data: result, error } = await sb.functions.invoke(
        "change-password",
        {
          body: {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      alertRef.current?.showAlert({
        variant: "default",
        message: t("auth:passwordChanged"),
      });

      router.replace("/profile");
    } catch (error: Error | any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:passwordChangeFailed"),
      });
    }
  }

  return (
    <Background>
      <View style={tw`flex-1 justify-center w-full`}>
        <View style={tw`w-full items-center`}>
          <Image
            style={tw`w-12 h-12 rounded-full mb-5`}
            source={require("@/assets/images/logo.png")}
          />
        </View>
        <Text style={tw`text-2xl font-bold text-accent mb-6 text-center`}>
          {t("settings:changePassword")}
        </Text>
        <View style={tw`w-full gap-y-2`}>
          <Controller
            control={control}
            name="oldPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("auth:oldPassword")}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("oldPassword");
                  onBlur();
                }}
                errors={errors.oldPassword?.message}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("auth:newPassword")}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("newPassword");
                  onBlur();
                }}
                errors={errors.newPassword?.message}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry
              />
            )}
          />
          <Controller
            control={control}
            name="confirmNewPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("auth:confirmPassword")}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("confirmNewPassword");
                  onBlur();
                }}
                errors={errors.confirmNewPassword?.message}
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
    </Background>
  );
}
