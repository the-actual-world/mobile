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
import { useTranslation } from "react-i18next";

export default function Login() {
  const { resetPasswordForEmail } = useSupabase();
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();
  const FormSchema = z.object({
    email: createFieldSchema(t, "email"),
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
      await resetPasswordForEmail(data.email);
      alertRef.current?.showAlert({
        variant: "default",
        message: t("auth:passwordReset"),
      });
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
          <Button
            variant="accent"
            label={t("auth:submit")}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />

          <View style={tw`flex-row w-full items-center justify-between -mt-1`}>
            <Text
              style={tw`muted`}
              onPress={() => {
                router.push("/login");
              }}
            >
              {t("auth:rememberedPassword")}
            </Text>
          </View>
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
