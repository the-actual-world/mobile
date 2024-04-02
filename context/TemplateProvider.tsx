import { Tables } from "@/supabase/functions/_shared/supabase";
import React from "react";
import { sb, useSupabase } from "./SupabaseProvider";
import { useTranslation } from "react-i18next";
import { Friend } from "@/lib/types";

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
          name: t("common.anonymous"),
          type: "sender",
        },
        status: "",
      }
    );
  }

  return (
    <FriendsContext.Provider value={{ friends, getFriendById }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return React.useContext(FriendsContext);
}
