import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { FlatList } from "react-native-gesture-handler";
import { Post, PostProps } from "@/components/Post";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { LocationUtils } from "@/lib/utils";

export default function Index() {
  const { session } = useSupabase();
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  const [posts, setPosts] = React.useState<PostProps[]>([]);

  const [offset, setOffset] = React.useState(0);
  const PAGE_SIZE = 20;

  async function getPosts() {
    const { data: newPosts, error } = await sb
      .from("posts") // TODO: change to `friends_posts` later
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(error);
      return;
    }

    if (newPosts) {
      const newPostsWithUsers = await Promise.all(
        newPosts.map(async (post) => {
          const user = await sb
            .from("users")
            .select("*")
            .eq("id", post.user_id)
            .single();

          const attachments = await sb
            .from("post_attachments")
            .select("*")
            .eq("post_id", post.id);

          console.log(post.location as string);

          return {
            id: post.id as string,
            author: {
              id: user.data?.id as string,
              name: user.data?.name as string,
            },
            text: post.text as string,
            attachments:
              attachments.data?.map((attachment) => ({
                caption: attachment.caption as string,
                path: attachment.path,
                media_type: attachment.media_type,
              })) || [],
            location: LocationUtils.parseLocation(post.location as string),
            updated_at: new Date(post.updated_at),
            created_at: new Date(post.created_at),
          };
        })
      );

      setPosts(newPostsWithUsers);

      setOffset(offset + newPosts.length);
    }
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
    getPosts();
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Background showScroll={false} noPadding>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isLoadingPosts}
            onRefresh={() => {
              setIsLoadingPosts(true);
              setTimeout(() => {
                setIsLoadingPosts(false);
              }, 1000);
            }}
          />
        }
        ItemSeparatorComponent={() => (
          <View
            style={tw`border-t border-border dark:border-dark-border my-5`}
          />
        )}
        onEndReached={getPosts}
        data={posts}
        renderItem={({ item }) => <Post {...item} key={item.id} />}
        keyExtractor={(item, index) => item.id}
      />
    </Background>
  );
}
