import tw from "@/lib/tailwind";
import { Stack, withLayoutContext } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { FriendAddedModal } from "@/components/FriendAddedModal";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { TabNavigationState, ParamListBase } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { FriendAddedModalContent } from "@/components/modal-content/FriendAdded";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default () => {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = React.useState(false);

  const { colorScheme } = useColorScheme();

  const [addedUser, setAddedUser] = React.useState<Tables<"users">>();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["40%"], []);
  const handlePresentAddUserModal = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

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

          if (!user) {
            return;
          }

          setAddedUser(user.data!);
          handlePresentAddUserModal();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <>
      <MaterialTopTabs
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: tw.color("accent"),
          },
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("background"),
          },
          tabBarLabelStyle: {
            color:
              colorScheme === "dark"
                ? tw.color("dark-foreground")
                : tw.color("foreground"),
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="manage-friends"
          options={{
            title: t("settings:manage"),
          }}
        />
        <MaterialTopTabs.Screen
          name="my-friend-address"
          options={{
            title: t("settings:address"),
          }}
        />
        <MaterialTopTabs.Screen
          name="add-friend"
          options={{
            title: t("settings:add"),
          }}
        />
      </MaterialTopTabs>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-background dark:bg-dark-background`}
        handleIndicatorStyle={tw`bg-muted-foreground dark:bg-dark-muted-foreground`}
        style={tw`px-6 py-4`}
      >
        <FriendAddedModalContent
          user={addedUser!}
          onClose={() => bottomSheetModalRef.current?.dismiss()}
        />
      </BottomSheetModal>
    </>
  );
};
