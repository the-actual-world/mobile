import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/Text";

import React from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { FlatList } from "react-native-gesture-handler";

export default function Index() {
  const { signOut } = useSupabase();
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(false);
  const [posts, setPosts] = React.useState([
    { title: "Post Title", content: "Post Content" },
  ]);

  return (
    <Background showScroll={false}>
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
        data={posts}
        renderItem={() => (
          <View style={tw`p-4 bg-white rounded-lg shadow mb-4`}>
            <Text style={tw`text-lg font-bold`}>Post Title</Text>
            <Text style={tw`text-sm text-gray-500`}>Post Content</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </Background>
  );
}
