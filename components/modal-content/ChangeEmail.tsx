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
  const { verifyOtp, session } = useSupabase();
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState<string>("");

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
      const { data: result, error } = await sb.auth.updateUser({
        email: data.email,
      });

      console.log(
        "HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"
      );

      console.log(result, error);

      if (error) {
        throw new Error(error.message);
      }

      setIsVerifying(true);
    } catch (error: Error | any) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:email-change-failed"),
      });
      onClose();
    }
  }

  async function handleVerificationCodeSubmitted() {
    if (verificationCode.length < 6)
      return alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:pleaseEnterValidCode"),
      });

    try {
      await verifyOtp(
        session?.user.email as string,
        verificationCode,
        "email_change"
      );
      onClose();
    } catch (error: Error | any) {
      console.error(error);
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:email-verification-failed"),
      });
    }
  }

  return (
    <>
      <View style={tw`flex-1 w-full`}>
        <View style={tw`w-full gap-y-2`}>
          {!isVerifying ? (
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
          ) : (
            <>
              <BottomSheetInput
                placeholder={t("auth:verification-code")}
                value={verificationCode}
                onChangeText={setVerificationCode}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry
              />
              <Button
                variant="accent"
                label={t("auth:submit")}
                onPress={handleVerificationCodeSubmitted}
              />
            </>
          )}
        </View>
      </View>
    </>
  );
}
