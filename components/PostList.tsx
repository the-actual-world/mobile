import Post, { PostProps } from "@/components/Post";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatListProps, View } from "react-native";
import {
  FlatList,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSettings } from "@/context/SettingsProvider";

export default function PostList({
  posts,
  isLoading = false,
  showButtons = true,
  ...props
}: {
  posts: PostProps[];
  isLoading: boolean;
  showButtons?: boolean;
} & any) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { settings } = useSettings();

  const postListRef = React.useRef<FlatList>(null);

  const goToTop = () => {
    postListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const CONTENT_OFFSET_THRESHOLD = 300;

  const _onViewableItemsChanged = React.useCallback(
    ({ viewableItems, changed }: { viewableItems: any[]; changed: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentPostIndex(viewableItems[0].index);
      }
    },
    []
  );

  function isIndexAvailable(index: number) {
    return posts[index] !== undefined;
  }

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  const [currentPostIndex, setCurrentPostIndex] = React.useState<number>(0);

  const scrollToXPost = (x: number) => {
    postListRef.current?.scrollToIndex({
      animated: !settings.timeline.snapToPosts,
      index: x,
    });
  };

  const isGoToTopVisible = useSharedValue(false);

  const goToTopAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isGoToTopVisible.value ? 1 : 0, { duration: 500 }),
      transform: [
        {
          translateY: withTiming(isGoToTopVisible.value ? 0 : -100, {
            duration: 500,
          }),
        },
      ],
    };
  });

  return (
    <View style={tw`flex-1 pt-1`}>
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
        <View style={tw`flex-1 justify-center items-center`}>
          <FlatList
            {...props}
            ItemSeparatorComponent={() => (
              <View
                style={tw`border-t border-border dark:border-dark-border my-1`}
              />
            )}
            data={posts}
            renderItem={({ item }) => <Post {...item} key={item.id} />}
            keyExtractor={(item, index) => item.id}
            ref={postListRef}
            snapToAlignment={
              settings.timeline.snapToPosts ? "start" : undefined
            }
            pagingEnabled={settings.timeline.snapToPosts}
            decelerationRate={settings.timeline.snapToPosts ? "fast" : "normal"}
            disableIntervalMomentum={settings.timeline.snapToPosts}
            ListEmptyComponent={
              <View style={tw`flex-1 items-center justify-center mt-5`}>
                <Image
                  source={require("@/assets/images/tumbleweed.gif")}
                  style={tw`w-40 h-40 rounded-lg mb-2`}
                />
                <Text style={tw`text-lg`}>{t("common:noPostsFound")}</Text>
              </View>
            }
            contentContainerStyle={tw`pb-20`}
            onScroll={(event) => {
              isGoToTopVisible.value =
                event.nativeEvent.contentOffset.y > CONTENT_OFFSET_THRESHOLD;
            }}
            onViewableItemsChanged={_onViewableItemsChanged}
            viewabilityConfig={viewConfigRef.current}
          />
          {showButtons && posts.length > 0 && (
            <>
              {settings.timeline.showScrollToTopButton && (
                <Animated.View
                  style={[
                    tw`absolute top-4 bg-muted dark:bg-dark-muted shadow-md rounded-full p-2`,
                    goToTopAnimatedStyle,
                  ]}
                >
                  <TouchableWithoutFeedback onPress={goToTop}>
                    <ArrowUpIcon
                      size={24}
                      color={
                        colorScheme === "dark"
                          ? tw.color("dark-foreground")
                          : tw.color("foreground")
                      }
                    />
                  </TouchableWithoutFeedback>
                </Animated.View>
              )}

              {settings.timeline.showUpAndDownButtons && (
                <View style={tw`absolute gap-2 right-2 pb-8`}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      scrollToXPost(currentPostIndex - 1);
                      setCurrentPostIndex((prev) => prev - 1);
                    }}
                    disabled={!isIndexAvailable(currentPostIndex - 1)}
                    style={[
                      tw`rounded-full bg-muted dark:bg-dark-muted p-2 shadow-md`,
                      {
                        opacity: isIndexAvailable(currentPostIndex - 1)
                          ? 1
                          : 0.5,
                      },
                    ]}
                  >
                    <ChevronUpIcon
                      size={26}
                      color={
                        colorScheme === "dark"
                          ? tw.color("dark-foreground")
                          : tw.color("foreground")
                      }
                    />
                  </TouchableWithoutFeedback>

                  <TouchableWithoutFeedback
                    onPress={() => {
                      scrollToXPost(currentPostIndex + 1);
                      setCurrentPostIndex((prev) => prev + 1);
                    }}
                    style={[
                      tw`rounded-full bg-muted dark:bg-dark-muted p-2 shadow-md`,
                      {
                        opacity: isIndexAvailable(currentPostIndex + 1)
                          ? 1
                          : 0.5,
                      },
                    ]}
                    disabled={!isIndexAvailable(currentPostIndex + 1)}
                  >
                    <ChevronDownIcon
                      size={26}
                      color={
                        colorScheme === "dark"
                          ? tw.color("dark-foreground")
                          : tw.color("foreground")
                      }
                    />
                  </TouchableWithoutFeedback>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
