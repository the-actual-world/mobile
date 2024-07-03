import tw from "@/lib/tailwind";
import { Stack, useGlobalSearchParams } from "expo-router";
import React from "react";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import { constants } from "@/constants/constants";
import { sb } from "@/context/SupabaseProvider";
import { Tables } from "@/supabase/functions/_shared/supabase";
import Avatar from "@/components/Avatar";
import { fonts } from "@/lib/styles";
import { View } from "react-native";

export default () => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const [appName, setAppName] = React.useState(constants.APP_NAME);
  const [removeNextLetterIn, setRemoveNextLetterIn] = React.useState(160);

  React.useEffect(() => {
    setTimeout(() => {
      const interval = setInterval(() => {
        setAppName((prev) => {
          if (prev.length === 0) {
            clearInterval(interval);
            return "";
          }

          setRemoveNextLetterIn((prev) => prev - 10);

          return prev.slice(0, -1);
        });
      }, removeNextLetterIn);
    }, 3500);
  }, []);

  function showWordOrAppName(word: string) {
    if (appName.length === 0) {
      return word;
    }

    return appName;
  }

  React.useEffect(() => {
    console.log(appName);
  }, [appName]);

  return (
    <Stack
      key={tw.memoBuster}
      screenOptions={{
        headerTintColor: tw.color("accent"),
        headerTitle: t("common:messages"),
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? tw.color("dark-background")
              : tw.color("background"),
        },
        headerRight: () => <Timer style={tw`mr-0`} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: showWordOrAppName(t("common:posts")),
        }}
      />
      <Stack.Screen
        name="collection/[id]"
        options={{
          headerTitle: () => {
            const { id } = useGlobalSearchParams();

            const [collection, setCollection] =
              React.useState<Tables<"post_collections"> | null>(null);

            React.useEffect(() => {
              async function fetchCollection() {
                const { data: collection, error } = await sb
                  .from("post_collections")
                  .select("*")
                  .eq("id", id as string)
                  .single();

                if (error) {
                  console.error(error);
                  return;
                }

                setCollection(collection);
              }

              if (id) {
                fetchCollection();
              }
            }, [id]);

            return (
              <View style={tw`gap-3 flex-row items-center -ml-3 flex-1`}>
                <Text style={[tw`text-lg`]}>
                  {collection?.emoji} {collection?.label}
                </Text>
              </View>
            );
          },
          headerRight: () => <></>,
        }}
      />
      <Stack.Screen
        name="post/[id]/index"
        options={{
          headerTitle: t("common:post_"),
        }}
      />
      <Stack.Screen
        name="post/[id]/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user/[id]"
        options={{
          headerTitle: () => {
            const { id } = useGlobalSearchParams();

            const [user, setUser] = React.useState<Tables<"users"> | null>(
              null
            );

            React.useEffect(() => {
              async function fetchUser() {
                const { data: user, error } = await sb
                  .from("users")
                  .select("*")
                  .eq("id", id as string)
                  .single();

                if (error) {
                  console.error(error);
                  return;
                }

                setUser(user);
              }

              if (id) {
                fetchUser();
              }
            }, [id]);

            return (
              <View style={tw`gap-3 flex-row items-center -ml-3 flex-1`}>
                <Avatar userId={id as string} size={35} />
                <Text
                  style={[
                    tw`text-lg`,
                    {
                      fontFamily: fonts.inter.medium,
                    },
                  ]}
                >
                  {user?.name}
                </Text>
              </View>
            );
          },
          headerRight: () => <></>,
        }}
      />
    </Stack>
  );
};
