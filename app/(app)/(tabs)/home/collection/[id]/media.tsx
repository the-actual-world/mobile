import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";
import React from "react";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { FlatList } from "react-native-gesture-handler";
import Post, { PostProps } from "@/components/Post";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { LocationUtils, PostUtils, getPostAttachmentSource } from "@/lib/utils";
import PostList from "@/components/PostList";
import Loading from "@/components/Loading";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { constants } from "@/constants/constants";
import { FlatGrid } from "react-native-super-grid";
import PostImage from "@/components/PostImage";
import ImageView from "react-native-image-viewing";

export default function Index() {
  const { session } = useSupabase();
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  const [posts, setPosts] = React.useState<PostProps[]>([]);

  const [offset, setOffset] = React.useState(0);

  const { id: collectionId } = useGlobalSearchParams();
  const [alreadyFetched, setAlreadyFetched] = React.useState(false);
  const [attachments, setAttachments] = React.useState<
    {
      caption: string;
      path: string;
      media_type: "video" | "image";
      post_id: string;
    }[]
  >([]);

  async function getMorePosts() {
    if (posts.length === 0) {
      if (alreadyFetched) {
        return;
      }
      setIsLoadingPosts(true);
      setAlreadyFetched(true);
    }

    const { data: postCollectionPosts, error: postCollectionPostsError } =
      await sb
        .from("post_collection_posts")
        .select("post_id")
        .eq("collection_id", collectionId as string)
        .range(offset, offset + constants.PAGE_SIZE - 1);

    if (postCollectionPostsError) {
      console.error(postCollectionPostsError);
      setIsLoadingPosts(false);
      return;
    }

    const postIds = postCollectionPosts.map((p) => p.post_id);
    if (postIds.length === 0) {
      setAlreadyFetched(true);
      setIsLoadingPosts(false);
      return;
    }

    const { data: newPosts, error } = await sb
      .from("posts")
      .select(
        "*, user:user_id(*), tagged_users:post_tagged_users(user:users(*)), attachments:post_attachments(*)"
      )
      .order("created_at", { ascending: false })
      .in("id", postIds)
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

  React.useEffect(() => {
    setAttachments(
      // get all post attachments from the post and add in the field post_id
      posts
        .map((post) =>
          post.attachments.map((attachment) => ({
            ...attachment,
            post_id: post.id,
          }))
        )
        .flat()
    );
  }, [posts]);

  React.useEffect(() => {
    getMorePosts();
  }, []);

  const [selectedAttachment, setSelectedAttachment] = React.useState<{
    path: string;
    post_id: string;
  } | null>(null);

  return (
    <Background showScroll={false} noPadding>
      <ImageView
        images={attachments.map((attachment) => ({
          uri: getPostAttachmentSource(
            attachment.path,
            posts.find((post) => post.id === attachment.post_id)?.author
              .id as string
          ),
        }))}
        imageIndex={attachments.findIndex(
          (attachment) => attachment.path === selectedAttachment?.path
        )}
        visible={selectedAttachment !== null}
        onRequestClose={() => setSelectedAttachment(null)}
        swipeToCloseEnabled={false}
        presentationStyle="overFullScreen"
      />
      <FlatGrid
        itemDimension={110}
        data={attachments}
        style={tw`flex-1`}
        spacing={0}
        onEndReached={getMorePosts}
        renderItem={({ item }) => (
          <View
            style={[tw`bg-background dark:bg-dark-background rounded-lg`]}
            key={item.path}
          >
            <PostImage
              key={item.path}
              caption={item.caption}
              path={item.path}
              media_type={item.media_type}
              post_id={item.post_id}
              user_id={
                posts.find((post) => post.id === item.post_id)?.author
                  .id as string
              }
              showLightbox={() => setSelectedAttachment(item)}
            />
          </View>
        )}
      />
    </Background>
  );
}
