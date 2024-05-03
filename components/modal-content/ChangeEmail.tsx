import * as React from "react";
import { KeyboardAvoidingView, View } from "react-native";
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
import { BottomSheetInput } from "../ui/BottomSheetInput";

export default function ChangeEmailModalContent({
  onClose,
}: {
  onClose: () => void;
}) {
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
      router.push(`/settings/${data.email}/verify-email-change`);
    } catch (error: Error | any) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:email-change-failed"),
      });
    } finally {
      onClose();
    }
  }

  return (
    <>
      <View style={tw`flex-1 w-full`}>
        <View style={tw`w-full gap-y-2`}>
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetInput
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
                />
              )}
            />
            <Button
              variant="accent"
              label={t("auth:submit")}
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </>
        </View>
      </View>
    </>
  );
}
