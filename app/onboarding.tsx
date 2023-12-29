import { Text } from "@/components/ui/Text";
import {
  Animated,
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import tw from "@/lib/tailwind";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingScreen() {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const slidesRef = React.useRef<any>(null);

  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const { colorScheme, toggleColorScheme, setColorScheme, changeColorScheme } =
    useColorScheme();

  const router = useRouter();

  const slides = [
    <View
      style={tw`
      flex-1
      justify-center
      px-10
      pt-10
    `}
    >
      <Image source={require("@/assets/logo.png")} style={tw`w-12 h-12 mb-6`} />
      {t("onboarding:slogan")
        .split(" ")
        .map((word, index) => {
          return (
            <Text style={tw`text-5xl leading-1.3`} key={index.toString()}>
              {word}
            </Text>
          );
        })}
    </View>,
    <View
      style={tw`
      flex-1
      items-center
      justify-center
      px-10
      pt-10
    `}
    >
      {colorScheme === "light" ? (
        <Image
          source={require("@/assets/illustrations/around-the-world.svg")}
          style={{
            flex: 0.6,
            width: width * 0.7,
          }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={require("@/assets/illustrations/around-the-world-dark.svg")}
          style={{
            flex: 0.6,
            width: width * 0.7,
          }}
          contentFit="contain"
        />
      )}
      <Text
        style={tw`
        text-3xl
        text-center
      `}
      >
        {t("onboarding:chooseLanguage")}
      </Text>
      <View style={tw`flex-row mt-4`}>
        <LanguageSwitcher />
      </View>
    </View>,
    <View
      style={tw`
      flex-1
      items-center
      justify-center
      px-10
      pt-10
    `}
    >
      {colorScheme === "light" ? (
        <Image
          source={require("@/assets/illustrations/color-schemes.svg")}
          style={{
            flex: 0.6,
            width: width * 0.7,
          }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={require("@/assets/illustrations/color-schemes-dark.svg")}
          style={{
            flex: 0.6,
            width: width * 0.7,
          }}
          contentFit="contain"
        />
      )}
      <Text
        style={tw`
        text-3xl
        text-center
      `}
      >
        {t("onboarding:chooseColorScheme")}
      </Text>
      <View style={tw`flex-row mt-6 gap-4`}>
        <Pressable
          style={tw`px-6 py-3 bg-[#ffffff] rounded-md border-2 border-accent shadow-lg shadow-accent`}
          onPress={() => {
            changeColorScheme("light");
          }}
        >
          <Text style={tw`text-black`}>{t("common:light")}</Text>
        </Pressable>

        <Pressable
          style={tw`px-6 py-3 bg-[#000000] rounded-md border-2 border-accent shadow-lg shadow-accent`}
          onPress={() => {
            changeColorScheme("dark");
          }}
        >
          <Text style={tw`text-white`}>{t("common:dark")}</Text>
        </Pressable>
      </View>
    </View>,
  ];

  const viewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      setCurrentIndex(viewableItems[0].index);
    }
  ).current;

  const viewConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View
      style={tw`flex-1 items-center justify-center bg-background dark:bg-dark-background`}
    >
      <View style={tw`flex-5`}>
        <FlatList
          data={slides}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          renderItem={({ item }) => <View style={{ width }}>{item}</View>}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>
      <View style={tw`flex-1 justify-center`}>
        <View style={tw`flex-row justify-center pb-10`}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                style={[
                  tw`rounded-full bg-primary dark:bg-dark-primary mx-2`,
                  { width: dotWidth, opacity, height: 8 },
                ]}
                key={index.toString()}
              />
            );
          })}
        </View>

        {currentIndex === slides.length - 1 ? (
          <View style={{ paddingBottom: 40 }}>
            <Button
              onPress={async () => {
                await AsyncStorage.setItem("finishedOnboarding", "true");
                router.replace("/sign-up");
              }}
              size="lg"
              label={t("common:done")}
            />
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: width * 0.8,
              paddingBottom: 40,
            }}
          >
            <Button
              variant="outline"
              onPress={() => {
                slidesRef.current?.scrollToIndex({
                  index: slides.length - 1,
                });
              }}
              size="lg"
              label={t("common:skip")}
            />
            <Button
              onPress={() => {
                if (currentIndex < slides.length - 1) {
                  slidesRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                  });
                }
              }}
              size="lg"
              label={t("common:next")}
            />
          </View>
        )}
      </View>
    </View>
  );
}
