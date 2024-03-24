import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect, useState } from "react";

import tw from "@/lib/tailwind";
import { useSupabase } from "@/context/useSupabase";
import { Background } from "@/components/Background";
import { useAlert } from "@/context/AlertContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AvatarEdit from "@/components/EditAvatar";
import { Link } from "expo-router";

export default function Index() {
  const alertRef = useAlert();
  const { sb, user, signOut } = useSupabase();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        const { data, error, status } = await sb
          .from("users")
          .select(`name`)
          .eq("id", user?.id ?? "")
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setName(data.name as string);
        }
      } catch (error) {
        if (error instanceof Error) {
          alertRef.current?.showAlert({
            title: t("common:error"),
            message: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    }
    getProfile();
    console.log(user);
  }, []);

  async function updateProfile({ name }: { name: string }) {
    try {
      setLoading(true);

      const updates = {
        name: name,
        updated_at: new Date().toISOString(),
      };
      const { error, status, statusText } = await sb
        .from("users")
        .update(updates)
        .eq("id", user?.id ?? "");

      if (error) {
        throw error;
      }

      alertRef.current?.showAlert({
        title: t("common:success"),
        message: t("profile:profileUpdated"),
        variant: "default",
      });
    } catch (error) {
      if (error instanceof Error) {
        alertRef.current?.showAlert({
          title: t("common:error"),
          message: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Background>
      <View style={tw`gap-2 self-stretch`}>
        <AvatarEdit
          size={150}
          onUpload={async (url: string) => {
            updateProfile({
              name: name,
            });
            console.log("Avatar uploaded: ", url);
          }}
        />
        <Input label={t("auth:email")} value={user?.email} disabled />
        <Input
          label={t("auth:name")}
          value={name || ""}
          onChangeText={(text) => setName(text)}
        />
      </View>

      <View style={[tw`py-4 self-stretch`]}>
        <Button
          label={loading ? t("common:loading") : t("common:save")}
          onPress={() => updateProfile({ name: name })}
          disabled={loading}
        />
      </View>

      <Text style={tw`text-center text-xs text-gray-400`}>
        Tags de Publicações
      </Text>

      <Text style={tw`py-4`}>
        Resumo de ontem (com popup noutro sítio a lembrar na primeira vez do
        dia)
      </Text>

      <Link
        href="/settings/change-password"
        style={tw`text-accent text-center py-2`}
      >
        {t("settings:changePassword")}
      </Link>

      <View style={tw`py-4`}>
        <Button label={t("auth:signOut")} onPress={signOut} />
      </View>
    </Background>
  );
}
