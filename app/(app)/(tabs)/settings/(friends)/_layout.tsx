import tw from "@/lib/tailwind";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { FriendAddedModal } from "@/components/FriendAddedModal";
import { useSupabase } from "@/context/useSupabase";

export default () => {
  const { t } = useTranslation();
  const { sb } = useSupabase();

  const [modalOpen, setModalOpen] = React.useState(false);

  const { colorScheme } = useColorScheme();

  const [addedUserName, setAddedUserName] = React.useState<string>("");
  const [addedUserId, setAddedUserId] = React.useState<string>("");

  React.useEffect(() => {
    const channel = sb
      .channel("friends")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friends",
        },
        async (payload) => {
          const user = await sb
            .from("users")
            .select("*")
            .eq("id", payload.new.sender_id)
            .single();

          setAddedUserName(user.data?.name);
          setAddedUserId(user.data?.id);
          setModalOpen(true);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerTintColor: tw.color("accent"),
          headerTitle: t("common:settings"),
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("background"),
          },
          headerRight: () => <Timer style={tw`mr-0`} />,
        }}
      >
        <Stack.Screen
          name="manage-friends"
          options={{
            headerTitle: t("settings:manageFriends"),
          }}
        />
        <Stack.Screen
          name="add-friend"
          options={{
            headerTitle: t("settings:addFriend"),
          }}
        />
        <Stack.Screen
          name="my-friend-address"
          options={{
            headerTitle: t("settings:friendAddress"),
          }}
        />
      </Stack>
      <FriendAddedModal
        show={modalOpen}
        close={() => setModalOpen(false)}
        userName={addedUserName}
        userId={addedUserId}
      />
    </>
  );
};
