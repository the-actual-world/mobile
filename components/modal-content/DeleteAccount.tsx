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
import { BottomSheetInput } from "../ui/BottomSheetInput";
import Checkbox from "expo-checkbox";
import { fonts } from "@/lib/styles";
import { TriangleAlertIcon } from "lucide-react-native";
import { Tables } from "@/supabase/functions/_shared/supabase";

export default function DeleteAccountModalContent({
  onClose,
  signOut,
  user,
}: {
  onClose: () => void;
  signOut: () => Promise<void>;
  user: Tables<"users">;
}) {
  const alertRef = useAlert();
  const { t } = useTranslation();
  const FormSchema = z
    .object({
      password: createFieldSchema(t, "password"),
      name: z.string({
        required_error: t("auth:fieldRequired"),
      }),
    })
    .refine((data) => data.name === user?.name, {
      message: t("auth:nameNotMatch"),
      path: ["name"],
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
        "delete-account",
        {
          body: {
            password: data.password,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      alertRef.current?.showAlert({
        variant: "default",
        message: t("auth:accountDeleted"),
      });

      await signOut();

      onClose();
    } catch (error: any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:failedToDeleteAccount"),
      });
    }
  }

  return (
    <>
      <View style={tw`flex-1 w-full`}>
        <TriangleAlertIcon
          size={72}
          style={tw`text-destructive dark:text-dark-destructive mx-auto mt-2 mb-2`}
        />

        <Text
          style={[
            tw`text-lg text-destructive dark:text-dark-destructive text-center mb-1`,
            {
              fontFamily: fonts.inter.semiBold,
            },
          ]}
        >
          {t("auth:deleteAccount")}
        </Text>
        <Text muted style={tw`text-xs text-center mb-5`}>
          {t("auth:deleteAccountDescription")}
        </Text>

        <View style={tw`w-full gap-y-2`}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetInput
                label={t("auth:delete-account-password")}
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
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetInput
                label={t("auth:delete-account-name")}
                placeholder={user?.name || ""}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("name");
                  onBlur();
                }}
                errors={errors.name?.message}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
              />
            )}
          />
          <Button
            variant="accent"
            label={t("auth:confirmDeleteAccount")}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </>
  );
}
