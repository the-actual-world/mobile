import * as React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAlert } from "@/context/AlertContext";
import { createFieldSchema } from "@/lib/restrictions";

export default function SignUp() {
  const { signUp } = useSupabase();
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();

  const FormSchema = z
    .object({
      name: createFieldSchema(t, "name"),
      birthDate: createFieldSchema(t, "birthDate"),
      email: createFieldSchema(t, "email"),
      password: createFieldSchema(t, "password"),
      confirmPassword: createFieldSchema(t, "confirmPassword"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth:passwordNotMatch"),
      path: ["confirmPassword"],
    });

  const { colorScheme, toggleColorScheme, setColorScheme, changeColorScheme } =
    useColorScheme();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (data.password !== data.confirmPassword) {
        alertRef.current?.showAlert({
          variant: "destructive",
          title: t("common:error"),
          message: t("auth:passwordNotMatch"),
        });
        return;
      }

      alertRef.current?.showAlert({
        variant: "default",
        title: t("common:loading"),
        message: t("auth:waitSignUp"),
      });

      await signUp(data.email, data.password, {
        name: data.name,
        birthdate: data.birthDate.toISOString().split("T")[0],
      });
      router.push({
        pathname: "/verify",
        params: { email: data.email },
      });
    } catch (error: Error | any) {
      alertRef.current?.showAlert({
        variant: "destructive",
        title: t("common:error"),
        message: t("auth:signUpFailed"),
      });
    }
  }

  React.useEffect(() => {
    (async () => {
      if ((await AsyncStorage.getItem("finishedOnboarding")) === null) {
        router.replace("/onboarding");
      }
    })();
  }, []);

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
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("auth:name")}
                value={value}
                onChangeText={onChange}
                onBlur={() => {
                  trigger("name");
                  onBlur();
                }}
                errors={errors.name?.message}
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text
                  style={[
                    tw`
                  flex h-10 w-full items-center rounded-md text-foreground dark:text-dark-foreground border border-input dark:border-dark-input bg-transparent px-3 py-2 text-sm
                  `,
                    errors.birthDate?.message &&
                      tw`border-destructive dark:border-dark-destructive`,
                    !value &&
                      tw`text-muted-foreground dark:text-dark-muted-foreground`,
                  ]}
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                >
                  {value
                    ? value.toLocaleDateString(t("common:currentLocale"))
                    : t("auth:birthdate")}
                </Text>
                {showDatePicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      onChange(selectedDate || value);
                    }}
                    maximumDate={
                      new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000)
                    }
                    minimumDate={
                      new Date(Date.now() - 150 * 365 * 24 * 60 * 60 * 1000)
                    }
                    locale={t("common:currentLocale")}
                  />
                )}

                {errors.birthDate?.message && (
                  <Text
                    style={tw`text-sm text-destructive dark:text-dark-destructive self-start -mt-1`}
                  >
                    {errors.birthDate?.message}
                  </Text>
                )}
              </>
            )}
          />

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
          {/* <Text
            style={tw`text-xs text-foreground dark:text-dark-foreground self-start mb-1.5`}
          >
            {t("auth:passwordNotice")}
          </Text> */}

          <Button
            variant="accent"
            label={t("auth:signUp")}
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />

          <View style={tw`flex-row w-full items-center justify-between -mt-1`}>
            <Text
              style={tw`muted`}
              onPress={() => {
                router.push("/onboarding");
              }}
            >
              {t("auth:onboarding")}
            </Text>
          </View>
        </View>
      </View>
      <View style={tw`w-full gap-y-4 mb-6`}>
        <Text
          style={tw`muted text-center`}
          onPress={() => {
            router.push("/login");
          }}
        >
          {t("auth:alreadyHaveAnAccount")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
