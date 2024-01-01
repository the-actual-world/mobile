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
import Avatar from "@/components/Avatar";

export default function Index() {
  const alertRef = useAlert();
  const { sb, user, signOut } = useSupabase();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);

        const { data, error, status } = await sb
          .from("users")
          .select(`name, avatar_url`)
          .eq("id", user?.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setName(data.name);
          setAvatarUrl(data.avatar_url);
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
  }, []);

  async function updateProfile({
    name,
    avatar_url,
  }: {
    name: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);

      const updates = {
        name: name,
        avatar_url: avatar_url,
        updated_at: new Date(),
      };
      const { error, status, statusText } = await sb
        .from("users")
        .update(updates)
        .eq("id", user?.id);

      console.log(error, status, statusText);

      if (error) {
        throw error;
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

  return (
    <Background>
      <View style={tw`gap-2 self-stretch`}>
        <Avatar
          size={150}
          url={avatarUrl}
          onUpload={async (url: string) => {
            console.log(url);
            setAvatarUrl(url);
            updateProfile({
              name: name,
              avatar_url: url,
            });
          }}
        />
        <Input label={t("auth:email")} value={user?.email} disabled />
        <Input
          label="Name"
          value={name || ""}
          onChangeText={(text) => setName(text)}
        />
      </View>

      <View style={[tw`py-4 self-stretch`]}>
        <Button
          label={loading ? "Loading ..." : "Update"}
          onPress={() => updateProfile({ name: name, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={tw`py-4`}>
        <Button label="Sign Out" onPress={signOut} />
      </View>
    </Background>
  );
}
