import { Post, PostProps } from "@/components/Post";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatListProps, View } from "react-native";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { useColorScheme } from "@/context/ColorSchemeProvider";

export default function PostList({
  posts,
  isLoading = false,
  ...props
}: {
  posts: PostProps[];
  isLoading: boolean;
} & any) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  return (
    <View style={tw`flex-1`}>
      {isLoading ? (
        <ContentLoader
          speed={2}
          width={400}
          height={600} // Adjust based on height
          viewBox="0 0 400 600" // Adjust based on width and height
          backgroundColor={
            colorScheme === "dark"
              ? tw.color("dark-border")
              : tw.color("border")
          }
          foregroundColor={
            colorScheme === "dark"
              ? tw.color("dark-new-background")
              : tw.color("new-background")
          }
          opacity={0.3}
          {...props}
        >
          <Circle cx="40" cy="30" r="25" />
          <Rect x="75" y="15" rx="4" ry="3" width="100" height="13" />
          <Rect x="75" y="35" rx="3" ry="2" width="50" height="10" />
          <Rect x="0" y="60" rx="3" ry="3" width="400" height="300" />

          <Circle cx="40" cy="400" r="25" />
          <Rect x="75" y="385" rx="4" ry="3" width="100" height="13" />
          <Rect x="75" y="405" rx="3" ry="2" width="50" height="10" />
          <Rect x="0" y="430" rx="3" ry="3" width="400" height="500" />
        </ContentLoader>
      ) : (
        <FlatList
          {...props}
          ItemSeparatorComponent={() => (
            <View
              style={tw`border-t border-border dark:border-dark-border my-5`}
            />
          )}
          data={posts}
          renderItem={({ item }) => <Post {...item} key={item.id} />}
          keyExtractor={(item, index) => item.id}
          ListEmptyComponent={
            <View style={tw`flex-1 items-center justify-center`}>
              <Image
                source={require("@/assets/images/tumbleweed.gif")}
                style={tw`w-40 h-40 rounded-lg mb-2`}
              />
              <Text style={tw`text-lg`}>{t("common:noPostsFound")}</Text>
            </View>
          }
          contentContainerStyle={tw`pt-2 pb-20`}
        />
      )}
    </View>
  );
}
