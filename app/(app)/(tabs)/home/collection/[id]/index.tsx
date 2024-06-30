import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect, useState, useCallback } from "react";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import Post, { PostProps } from "@/components/Post";
import { Tables } from "@/supabase/functions/_shared/supabase";
import PostList from "@/components/PostList";
import Loading from "@/components/Loading";
import { useGlobalSearchParams } from "expo-router";
import { constants } from "@/constants/constants";
import { LocationUtils, PostUtils } from "@/lib/utils";

export default function CollectionPosts() {
  const { session } = useSupabase();
  const { id: collectionId } = useGlobalSearchParams();
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [offset, setOffset] = useState(0);
  const [alreadyFetched, setAlreadyFetched] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false); // New state to handle no more posts

  const fetchPosts = useCallback(
    async (initial = false) => {
      if (!collectionId || isLoadingPosts || noMorePosts) return; // Check if no more posts

      if (initial) {
        setIsLoadingPosts(true);
        setAlreadyFetched(false);
        setOffset(0);
        setNoMorePosts(false); // Reset no more posts flag on initial fetch
      }

      const { data: postCollectionPosts, error: postCollectionPostsError } =
        await sb
          .from("post_collection_posts")
          .select("post_id")
          .eq("collection_id", collectionId)
          .range(offset, offset + constants.PAGE_SIZE - 1);

      if (postCollectionPostsError) {
        console.error(postCollectionPostsError);
        setIsLoadingPosts(false);
        return;
      }

      const postIds = postCollectionPosts.map((p) => p.post_id);
      if (postIds.length === 0) {
        setAlreadyFetched(true);
        setNoMorePosts(true); // Set no more posts flag
        setIsLoadingPosts(false);
        return;
      }

      const { data: newPosts, error: newPostsError } = await sb
        .from("posts")
        .select(
          "*, user:user_id(*), tagged_users:post_tagged_users(user:users(*)), attachments:post_attachments(*)"
        )
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (newPostsError) {
        console.error(newPostsError);
        setIsLoadingPosts(false);
        return;
      }

      const newPostsSetupWithProps = newPosts.map((post) =>
        PostUtils.turnPostIntoPostProps(post)
      );

      setPosts((prev) =>
        initial ? newPostsSetupWithProps : [...prev, ...newPostsSetupWithProps]
      );
      setOffset(offset + newPosts.length);
      setIsLoadingPosts(false);
    },
    [collectionId, isLoadingPosts, offset, noMorePosts]
  );

  const setupRealtimeUpdates = useCallback(() => {
    const channel = sb.channel(`collection-posts-${collectionId}`);

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_collection_posts" },
      async (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "DELETE") {
          fetchPosts(true);
        }
      }
    );

    return channel.subscribe();
  }, [collectionId, fetchPosts]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    const subscription = setupRealtimeUpdates();
    return () => {
      subscription.unsubscribe();
    };
  }, [setupRealtimeUpdates]);

  return (
    <Background showScroll={false} noPadding style={tw`w-full`}>
      <PostList
        style={tw`w-full`}
        posts={posts}
        isLoading={isLoadingPosts}
        onEndReached={() => fetchPosts()}
      />
    </Background>
  );
}
