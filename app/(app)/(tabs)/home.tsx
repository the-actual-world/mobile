import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { FlatList } from "react-native-gesture-handler";
import { Post, PostProps } from "@/components/Post";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { LocationUtils, PostUtils } from "@/lib/utils";
import PostList from "@/assets/PostList";
import Loading from "@/components/Loading";

export default function Index() {
  const { session } = useSupabase();
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  const [posts, setPosts] = React.useState<PostProps[]>([]);

  const [offset, setOffset] = React.useState(0);
  const PAGE_SIZE = 5;

  async function getMorePosts() {
    if (posts.length === 0) {
      setIsLoadingPosts(true);
    }

    const { data: newPosts, error } = await sb
      .from("posts") // TODO: change to `friends_posts` later
      .select("*, user:users(*), attachments:post_attachments(*)")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(error);
      return;
    }

    if (newPosts.length > 0) {
      const newPostsSetupWithProps = newPosts.map((post) =>
        PostUtils.turnPostIntoPostProps(post)
      );

      setPosts((prev) => [...prev, ...newPostsSetupWithProps]);

      setOffset(offset + newPosts.length);
    }

    setIsLoadingPosts(false);
  }

  function setupRealtimeUpdates() {
    const subscription = sb.channel("home-posts").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "posts",
      },
      async (payload) => {
        if (
          payload.eventType === "INSERT" &&
          payload.new.user_id !== session?.user.id
        ) {
          console.log("New post", payload.new);
          const newPost = payload.new as Tables<"posts">;

          const newPostUser = await sb
            .from("users")
            .select("*")
            .eq("id", newPost.user_id)
            .single();

          const newPostAttachments = await sb
            .from("post_attachments")
            .select("*")
            .eq("post_id", newPost.id);

          console.log(newPostAttachments.data);
          console.log(newPost);

          const newRecord: PostProps = {
            id: newPost.id as string,
            author: {
              id: newPostUser.data?.id as string,
              name: newPostUser.data?.name as string,
            },
            text: newPost.text as string,
            attachments:
              newPostAttachments.data?.map((attachment) => ({
                caption: attachment.caption as string,
                path: attachment.path,
                media_type: attachment.media_type,
              })) || [],
            location: LocationUtils.parseLocation(newPost.location as string),
            updated_at: new Date(newPost.updated_at),
            created_at: new Date(newPost.created_at),
          };

          setPosts((prev) => [newRecord, ...prev]);
        }
      }
    );

    return subscription;
  }

  React.useEffect(() => {
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Background showScroll={false} noPadding>
      <PostList
        posts={posts}
        isLoading={isLoadingPosts}
        onEndReached={getMorePosts}
      />
    </Background>
  );
}
