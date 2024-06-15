import { Tables } from "@/supabase/functions/_shared/supabase";
import React from "react";
import { sb, useSupabase } from "./SupabaseProvider";
import { useTranslation } from "react-i18next";
import { Friend } from "@/lib/types";
import { useColorScheme } from "./ColorSchemeProvider";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import tw from "@/lib/tailwind";
import { FriendAddedModalContent } from "@/components/modal-content/FriendAdded";
import { StyleSheet } from "react-native";

const FriendsContext = React.createContext<{
  friends: Friend[];
  getFriendById: (id: string) => {
    user: {
      id: string;
      name: string;
      type: "sender" | "receiver";
    };
    status: string;
  };
}>({
  friends: [],
  getFriendById: () => {
    return {
      user: {
        id: "",
        name: "",
        type: "sender",
      },
      status: "",
    };
  },
});

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const { session } = useSupabase();
  const { t } = useTranslation();

  const { colorScheme } = useColorScheme();

  const [addedUser, setAddedUser] = React.useState<Tables<"users">>();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["35%"], []);

  async function getFriends() {
    if (!session) return;

    const { data: fetchedFriends, error } = await sb
      .from("friends")
      .select(
        "sender: sender_id(id, name), receiver: receiver_id(id, name), status"
      );

    const currentUserId = (await sb.auth.getUser()).data.user?.id;
    const newFriends = fetchedFriends as any;

    let friends: Friend[] = [];
    newFriends.forEach((friend: any) => {
      if (friend.receiver.id === currentUserId) {
        friends.push({
          user: {
            id: friend.sender.id,
            name: friend.sender.name,
            type: "sender",
          },
          status: friend.status,
        });
      } else {
        friends.push({
          user: {
            id: friend.receiver.id,
            name: friend.receiver.name,
            type: "receiver",
          },
          status: friend.status,
        });
      }
    });

    setFriends(friends);
  }

  function setupRealtimeUpdates() {
    return sb
      .channel("all_friends")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
        },
        async (payload) => {
          getFriends();

          if (payload.eventType === "INSERT") {
            const user = await sb
              .from("users")
              .select("*")
              .eq("id", payload.new.sender_id)
              .single();

            if (!user || user.data?.id === session?.user?.id) {
              return;
            }

            setAddedUser(user.data!);
            bottomSheetModalRef.current?.present();
          }
        }
      )
      .subscribe();
  }

  React.useEffect(() => {
    if (!session) return;
    getFriends();

    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  function getFriendById(id: string) {
    return (
      friends.find((friend) => friend.user.id === id) || {
        user: {
          id: "",
          name: t("common:unknown"),
          type: "sender",
        },
        status: "",
      }
    );
  }

  return (
    <FriendsContext.Provider value={{ friends, getFriendById }}>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-new-bg border-t border-bd`}
        handleIndicatorStyle={tw`bg-mt-fg`}
        style={tw`px-6 py-4`}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            enableTouchThrough={false}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={[
              { backgroundColor: "rgba(0, 0, 0, 1)" },
              StyleSheet.absoluteFillObject,
            ]}
          />
        )}
      >
        <FriendAddedModalContent
          user={addedUser!}
          onClose={() => bottomSheetModalRef.current?.dismiss()}
        />
      </BottomSheetModal>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return React.useContext(FriendsContext);
}
