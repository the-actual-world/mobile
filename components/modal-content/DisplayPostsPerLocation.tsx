import * as React from "react";
import { View } from "react-native";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Error } from "@/lib/types";
import { Image } from "expo-image";
import { useAlert } from "@/context/AlertProvider";
import { createFieldSchema } from "@/lib/restrictions";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Background } from "@/components/Background";
import { BottomSheetInput } from "../ui/BottomSheetInput";
import PostList from "../PostList";
import { PostProps } from "../Post";
import { LatLng } from "react-native-maps";
import { LocationUtils, PostUtils } from "@/lib/utils";
import { Tables } from "@/supabase/functions/_shared/supabase";

export default function DisplayPostsPer({
  locations,
}: {
  locations: LatLng[];
}) {
  const router = useRouter();
  const alertRef = useAlert();
  const { t } = useTranslation();
  const [posts, setPosts] = React.useState<PostProps[]>([]);
  const { session } = useSupabase();

  React.useEffect(() => {
    async function getPosts() {
      const { data: newPosts, error } = await sb.rpc(
        "get_user_posts_in_locations",
        {
          locations: locations.map((location) =>
            LocationUtils.stringifyLocation(location)
          ),
        }
      );

      console.log("newPosts", JSON.stringify(newPosts));

      if (error) {
        console.error(error);
        return;
      }

      if (newPosts.length > 0) {
        const newPostsSetupWithProps = newPosts.map((post) =>
          PostUtils.turnPostIntoPostProps({
            id: post.post_id,
            text: post.post_text,
            created_at: post.post_created_at,
            location: post.post_location,
            updated_at: post.post_updated_at,
            user_id: (post.user_record as Tables<"users">)["id"] as string,
            attachments: post.attachments as Tables<"post_attachments">[],
            tagged_users: post.tagged_users?.map(
              (taggedUser: { id: string; name: string }) => ({
                user: taggedUser,
              })
            ),
            user: post.user_record as Tables<"users">,
          })
        );

        setPosts(newPostsSetupWithProps);
      }
    }

    getPosts();
  }, []);

  return (
    <>
      <View style={tw`flex-1 w-full`}>
        <PostList posts={posts} style={tw`w-full`} />
      </View>
    </>
  );
}
