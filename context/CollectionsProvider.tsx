import React from "react";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { sb, useSupabase } from "./SupabaseProvider";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useColorScheme } from "./ColorSchemeProvider";
import tw from "@/lib/tailwind";
import { StyleSheet } from "react-native";
import ListEmptyText from "@/components/ListEmptyText";
import { View, Text } from "react-native";

// Define Collection type
type Collection = Tables<"post_collections"> & {
  posts: {
    id: string;
  }[];
};

const CollectionsContext = React.createContext<{
  collections: Collection[];
  getCollectionById: (id: string) => Collection | undefined;
  isPostInCollection: (postId: string, collectionId: string) => boolean;
  togglePostInCollection: (postId: string, collectionId: string) => void;
}>({
  collections: [],
  getCollectionById: () => undefined,
  isPostInCollection: () => false,
  togglePostInCollection: () => {},
});

export function CollectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const { session } = useSupabase();

  async function getCollections() {
    if (!session) return;

    const { data: fetchedCollections, error } = await sb
      .from("post_collections")
      .select(
        `
        *,
        posts(id)
      `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setCollections(fetchedCollections as Collection[]);
  }

  function setupRealtimeUpdates() {
    return sb
      .channel("all_collections")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_collections",
        },
        async () => {
          getCollections();
        }
      )
      .subscribe();
  }

  React.useEffect(() => {
    if (!session) return;
    getCollections();

    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  function getCollectionById(id: string) {
    return collections.find((collection) => collection.id === id);
  }

  function isPostInCollection(postId: string, collectionId: string) {
    const collection = getCollectionById(collectionId);
    if (!collection) return false;
    return collection.posts.some((post) => post.id === postId);
  }

  async function togglePostInCollection(postId: string, collectionId: string) {
    const postIsInCollection = isPostInCollection(postId, collectionId); // Rename the variable here

    if (postIsInCollection) {
      const { error } = await sb
        .from("post_collection_posts")
        .delete()
        .eq("post_id", postId)
        .eq("collection_id", collectionId);

      if (error) {
        console.error(error);
        return;
      }

      const collection = getCollectionById(collectionId);
      if (collection) {
        collection.posts = collection.posts.filter(
          (post) => post.id !== postId
        );
        setCollections([...collections]);
      }
    } else {
      const { error } = await sb.from("post_collection_posts").insert({
        post_id: postId,
        collection_id: collectionId,
      });

      if (error) {
        console.error(error);
        return;
      }

      const collection = getCollectionById(collectionId);
      if (collection) {
        collection.posts = [...collection.posts, { id: postId }];
        setCollections([...collections]);
      }
    }
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        getCollectionById,
        isPostInCollection,
        togglePostInCollection,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  return React.useContext(CollectionsContext);
}
