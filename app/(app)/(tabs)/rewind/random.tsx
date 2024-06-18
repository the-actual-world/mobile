import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect } from "react";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { fonts } from "@/lib/styles";
import Calendar from "@/components/ui/Calendar";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { BrainIcon, SaveIcon } from "lucide-react-native";
import { DateData } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import { useAlert } from "@/context/AlertProvider";
import { Tables } from "@/supabase/functions/_shared/supabase";
import MapView from "react-native-maps";
import { DateUtils, PostUtils } from "@/lib/utils";
import Post, { PostProps } from "@/components/Post";
import ListEmptyText from "@/components/ListEmptyText";

export default function () {
  const { t } = useTranslation();
  const alertRef = useAlert();
  const { colorScheme } = useColorScheme();
  const [post, setPost] = React.useState<PostProps | null>(null);

  async function getRandomPost() {
    const { data, error } = await sb
      .from("random_posts_where_i_am")
      .select("*")
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (data.length === 0) {
      alertRef.current?.showAlert({
        title: t("rewind:noPosts"),
        variant: "destructive",
      });
      return;
    }

    const post = data[0];

    const randomPostUser = await sb
      .from("users")
      .select("*")
      .eq("id", post.user_id as string)
      .single();

    const randomPostAttachments = await sb
      .from("post_attachments")
      .select("*")
      .eq("post_id", post.id as string);

    const randomPostTaggedUsers = await sb
      .from("post_tagged_users")
      .select("user:users(*)")
      .eq("post_id", post.id as string);

    console.log(randomPostTaggedUsers.data);

    setPost(
      PostUtils.turnPostIntoPostProps({
        ...post,
        user: randomPostUser.data,
        attachments: randomPostAttachments.data || [],
        tagged_users: randomPostTaggedUsers.data,
      })
    );
  }

  useEffect(() => {
    getRandomPost();
  }, []);

  return (
    <Background noPadding>
      <Button
        icon={
          <BrainIcon
            size={24}
            color={
              colorScheme === "dark"
                ? tw.color("dark-background")
                : tw.color("background")
            }
          />
        }
        style={tw`mx-4 mt-4`}
        onPress={getRandomPost}
        label={t("rewind:randomPost")}
      />

      {post ? <Post {...post} /> : <ListEmptyText text={t("rewind:noPosts")} />}
    </Background>
  );
}
