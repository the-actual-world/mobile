import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import Post, { PostProps } from "@/components/Post";
import { Text } from "@/components/ui/Text";
import Avatar from "@/components/Avatar";
import tw from "@/lib/tailwind";
import { getPostAttachmentSource, LocationUtils } from "@/lib/utils";
import { Database } from "@/supabase/functions/_shared/supabase";
import Comments from "@/components/Comments";
import { Background } from "@/components/Background";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SendIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAlert } from "@/context/AlertProvider";

const SinglePost = () => {
  const { id } = useLocalSearchParams();
  const { session } = useSupabase();
  const [post, setPost] = useState<PostProps | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const alertRef = useAlert();

  useEffect(() => {
    fetchPost();
    fetchComments();
    const subscription = setupRealtimeUpdates();
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await sb
      .from("posts")
      .select("*, user:users(*), attachments:post_attachments(*)")
      .eq("id", id as string)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const postProps = {
      id: data.id,
      author: {
        id: data.user?.id,
        name: data.user?.name,
      },
      text: data.text,
      attachments: data.attachments.map((attachment) => ({
        caption: attachment.caption,
        path: attachment.path,
        media_type: attachment.media_type,
      })),
      location: LocationUtils.parseLocation(data.location!),
      updated_at: new Date(data.updated_at),
      created_at: new Date(data.created_at),
    };

    setPost(postProps);
  };

  const fetchComments = async () => {
    const { data, error } = await sb
      .from("post_comments")
      .select("*, user:users(*)")
      .eq("post_id", id as string)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setComments(data);
  };

  const handleAddComment = async () => {
    if (!commentText) return;

    const { data, error } = await sb.from("post_comments").insert([
      {
        post_id: id as string,
        user_id: session?.user.id as string,
        text: commentText,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    alertRef.current?.showAlert({
      title: t("common:success"),
      message: t("comment:commentAdded"),
      variant: "info",
    });

    setCommentText("");
  };

  const handleUpdateComment = (updatedComment) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const setupRealtimeUpdates = () => {
    const subscription = sb
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${id}`,
        },
        async (payload) => {
          const user = await sb
            .from("users")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

          if (payload.eventType === "INSERT") {
            setComments((prevComments) => [
              ...prevComments,
              { ...payload.new, user: user.data },
            ]);
          } else if (payload.eventType === "UPDATE") {
            setComments((prevComments) =>
              prevComments.map((comment) =>
                comment.id === payload.new.id
                  ? { ...payload.new, user: user.data }
                  : comment
              )
            );
          }
        }
      )
      .subscribe();

    return subscription;
  };

  const { t } = useTranslation();

  return (
    <Background noPadding>
      {post && (
        <>
          <Post {...post} linkToPost={false} />
          <View
            style={tw`border-t border-border dark:border-dark-border mb-4`}
          />
          <View style={tw`px-4 w-full mb-20`}>
            <View style={tw`flex flex-row justify-between gap-2`}>
              <Input
                placeholder={t("comment:addComment")}
                value={commentText}
                onChangeText={setCommentText}
                style={tw`flex-1`}
              />
              <Button
                size="icon"
                onPress={handleAddComment}
                disabled={!commentText}
              >
                <SendIcon size={24} color={"white"} />
              </Button>
            </View>
            <Comments comments={comments} />
          </View>
        </>
      )}
    </Background>
  );
};

export default SinglePost;
