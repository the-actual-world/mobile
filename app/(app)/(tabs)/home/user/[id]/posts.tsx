import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { FlatList } from "react-native-gesture-handler";
import Post, { PostProps } from "@/components/Post";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { LocationUtils, PostUtils } from "@/lib/utils";
import PostList from "@/components/PostList";
import Loading from "@/components/Loading";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { constants } from "@/constants/constants";

export default function Index() {
  const { session } = useSupabase();
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  const [posts, setPosts] = React.useState<PostProps[]>([]);

  const [offset, setOffset] = React.useState(0);

  const { id } = useGlobalSearchParams();
  const [alreadyFetched, setAlreadyFetched] = React.useState(false);

  async function getMorePosts() {
    if (posts.length === 0) {
      if (alreadyFetched) {
        return;
      }
      setIsLoadingPosts(true);
      setAlreadyFetched(true);
    }

    const { data: newPosts, error } = await sb
      .from("posts")
      .select(
        "*, user:user_id(*), tagged_users:post_tagged_users(user:users(*)), attachments:post_attachments(*)"
      )
      .order("created_at", { ascending: false })
      .eq("user_id", id as string)
      .range(offset, offset + constants.PAGE_SIZE - 1);

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
    const subscription = sb
      .channel("user-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `user_id=eq.${id}`,
        },
        async (payload) => {
          console.log("NEW EVENT CAUGHT IN USER PAGE");
          if (payload.eventType === "INSERT") {
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

            const newPostTaggedUsers = await sb
              .from("post_tagged_users")
              .select("*, user:users(*)")
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
              tagged_users:
                newPostTaggedUsers.data?.map((taggedUser) => ({
                  id: taggedUser.user?.id as string,
                  name: taggedUser.user?.name as string,
                })) || [],
              location: LocationUtils.parseLocation(newPost.location as string),
              updated_at: new Date(newPost.updated_at),
              created_at: new Date(newPost.created_at),
            };

            setPosts((prev) => [newRecord, ...prev]);
          } else if (payload.eventType === "DELETE") {
            console.log("Deleted post", payload.old);
            const deletedPost = payload.old as Tables<"posts">;

            setPosts((prev) =>
              prev.filter((post) => post.id !== deletedPost.id)
            );
          } else if (payload.eventType === "UPDATE") {
            console.log("Updated post", payload.new);
            const updatedPost = payload.new as Tables<"posts">;

            const updatedPostUser = await sb
              .from("users")
              .select("*")
              .eq("id", updatedPost.user_id)
              .single();

            const updatedPostAttachments = await sb
              .from("post_attachments")
              .select("*")
              .eq("post_id", updatedPost.id);

            const updatedPostTaggedUsers = await sb
              .from("post_tagged_users")
              .select("*, user:users(*)")
              .eq("post_id", updatedPost.id);

            const updatedRecord: PostProps = {
              id: updatedPost.id as string,
              author: {
                id: updatedPostUser.data?.id as string,
                name: updatedPostUser.data?.name as string,
              },
              text: updatedPost.text as string,
              attachments:
                updatedPostAttachments.data?.map((attachment) => ({
                  caption: attachment.caption as string,
                  path: attachment.path,
                  media_type: attachment.media_type,
                })) || [],
              tagged_users:
                updatedPostTaggedUsers.data?.map((taggedUser) => ({
                  id: taggedUser.user?.id as string,
                  name: taggedUser.user?.name as string,
                })) || [],
              location: LocationUtils.parseLocation(
                updatedPost.location as string
              ),
              updated_at: new Date(updatedPost.updated_at),
              created_at: new Date(updatedPost.created_at),
            };

            setPosts((prev) =>
              prev.map((post) => {
                if (post.id === updatedRecord.id) {
                  return updatedRecord;
                } else {
                  return post;
                }
              })
            );
          }
        }
      )
      .subscribe();

    return subscription;
  }

  React.useEffect(() => {
    const subscription = setupRealtimeUpdates();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Background showScroll={false} noPadding style={tw`w-full`}>
      <PostList
        style={tw`w-full`}
        posts={posts}
        isLoading={isLoadingPosts}
        onEndReached={getMorePosts}
        onRefresh={() => {
          setOffset(0);
          setAlreadyFetched(false);
          setPosts([]);
        }}
        refreshing={isLoadingPosts}
      />
    </Background>
  );
}
