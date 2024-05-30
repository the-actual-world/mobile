import { Text } from "@/components/ui/Text";
import {
  Animated,
  FlatList,
  Linking,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import tw from "@/lib/tailwind";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fonts } from "@/lib/styles";
import { constants } from "@/constants/constants";

function BaseTitle({ text }: { text: string }) {
  return (
    <Text
      style={[
        tw`
      text-3xl
      text-center
      `,
        {
          fontFamily: fonts.inter.semiBold,
        },
      ]}
    >
      {text}
    </Text>
  );
}

function BaseSubtitle({ text }: { text: string }) {
  return (
    <Text
      style={tw`
      text-xl
      text-center
    `}
    >
      {text}
    </Text>
  );
}

function BaseBackground({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={tw`
      flex-1
      items-center
      justify-center
      px-10
      pt-10
    `}
    >
      {children}
    </View>
  );
}

function BaseImage({ source, width }: { source: any; width: number }) {
  return (
    <Image
      source={source}
      style={{
        flex: 0.6,
        width: width * 0.7,
      }}
      contentFit="contain"
    />
  );
}

function BaseImageWithTheme({
  light,
  dark,
  width,
}: {
  light: any;
  dark: any;
  width: number;
}) {
  const { colorScheme } = useColorScheme();

  return colorScheme === "light" ? (
    <BaseImage source={light} width={width} />
  ) : (
    <BaseImage source={dark} width={width} />
  );
}

export default function OnboardingScreen() {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const slidesRef = React.useRef<any>(null);

  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const { colorScheme, setColorScheme, changeColorScheme } = useColorScheme();

  const router = useRouter();

  const slides = [
    <View style={tw`flex-1 justify-center pt-13`}>
      <View style={tw`items-center`}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={tw`w-12 h-12 mb-6`}
        />
        <Text
          style={[
            tw`text-3xl mb-2`,
            {
              fontFamily: fonts.inter.medium,
            },
          ]}
        >
          The Actual World
        </Text>
        <Text
          style={[
            tw`text-xl leading-1.2`,
            {
              fontFamily: fonts.inter.light,
            },
          ]}
        >
          {t("onboarding:slogan")}
        </Text>
      </View>
    </View>,
    <BaseBackground>
      <BaseImageWithTheme
        light={require("@/assets/illustrations/around-the-world.svg")}
        dark={require("@/assets/illustrations/around-the-world-dark.svg")}
        width={width}
      />
      <View style={tw`flex-row mt-2`}>
        <LanguageSwitcher />
      </View>
    </BaseBackground>,
    <BaseBackground>
      {/* Capture the right moments */}
      <BaseSubtitle text={t("onboarding:captureMoments")} />
      <BaseImage
        source={require("@/assets/illustrations/capture-moments.svg")}
        width={width}
      />
    </BaseBackground>,
    <BaseBackground>
      {/* ...with just the right people */}
      <BaseSubtitle text={t("onboarding:rightPeople")} />
      <BaseImage
        source={require("@/assets/illustrations/right-people.svg")}
        width={width}
      />
    </BaseBackground>,
    <BaseBackground>
      {/* ...at just the right time */}
      <BaseSubtitle text={t("onboarding:rightTime")} />
      <BaseImage
        source={require("@/assets/illustrations/right-time.svg")}
        width={width}
      />
    </BaseBackground>,
    <BaseBackground>
      {/* ...and remember them forever */}
      <BaseSubtitle text={t("onboarding:rememberForever")} />
      <BaseImage
        source={require("@/assets/illustrations/remember-forever.svg")}
        width={width}
      />
    </BaseBackground>,
    <BaseBackground>
      {/* ...safely and securely. */}
      <BaseSubtitle text={t("onboarding:privacy")} />
      <BaseImage
        source={require("@/assets/illustrations/privacy.svg")}
        width={width}
      />
    </BaseBackground>,
    <BaseBackground>
      <BaseImageWithTheme
        light={require("@/assets/illustrations/color-schemes.svg")}
        dark={require("@/assets/illustrations/color-schemes-dark.svg")}
        width={width}
      />
      <View style={tw`flex-row mt-2 gap-4`}>
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
    </BaseBackground>,
    <BaseBackground>
      <BaseSubtitle text={`${t("onboarding:welcome")} 👋`} />

      <Button
        onPress={async () => {
          Linking.openURL(`${constants.WEBSITE_URL}`);
        }}
        style={tw`mb-2 mt-4`}
        variant="outline"
        label={t("common:checkoutWebsite")}
      />
      <Button
        onPress={async () => {
          Linking.openURL(`${constants.WEBSITE_URL}/pricing`);
        }}
        variant="secondary"
        label={t("common:checkoutPricing")}
      />
    </BaseBackground>,
  ];

  const viewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      setCurrentIndex(viewableItems[0].index || 0);
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
                  tw`rounded-full bg-primary dark:bg-dark-primary mx-1.5`,
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
