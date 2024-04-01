import { useAlert } from "@/context/AlertProvider";
import { createFieldSchema } from "@/lib/restrictions";
import tw from "@/lib/tailwind";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { CheckIcon, XIcon } from "lucide-react-native";
import { sb } from "@/context/SupabaseProvider";
import { Button } from "../ui/Button";
import Avatar from "../Avatar";
import React from "react";
import { Tables } from "@/supabase/functions/_shared/supabase";

export const FriendAddedModalContent = ({
  onClose,
  user,
}: {
  onClose: () => void;
  user: Tables<"users">;
}) => {
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={tw`h4`}>{t("settings:newFriendRequest")}</Text>
      <View
        style={tw`w-20 h-[0.6] rounded-full mt-2 bg-dark-background/10 dark:bg-background/15`}
      ></View>

      <View style={tw`flex-row items-center mt-6`}>
        <Avatar size={52} userId={user.id} />
        <View style={tw`ml-4`}>
          <Text style={tw`h5`}>{user.name}</Text>
          <Text style={tw`text-gray-500`}>{user.email}</Text>
        </View>
      </View>

      <View style={tw`flex-row justify-between mt-6`}>
        <Button
          onPress={async () => {
            await sb.from("friends").delete().eq("sender_id", user.id);
            onClose();
          }}
          label={t("common:decline")}
          variant="destructive"
          icon={<XIcon size={20} color="white" />}
        />

        <Button
          onPress={async () => {
            await sb
              .from("friends")
              .update({ status: "accepted" })
              .eq("sender_id", user.id);
            onClose();
          }}
          label={t("common:accept")}
          icon={<CheckIcon size={20} color="white" />}
        />
      </View>
    </View>
  );
};
