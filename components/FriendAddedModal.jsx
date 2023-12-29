import { useColorScheme } from "@/context/ColorSchemeProvider";
import tw from "@/lib/tailwind";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Button } from "./ui/Button";
import { CheckIcon, XIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text } from "./ui/Text";
import { Image } from "expo-image";
import { useSupabase } from "@/context/useSupabase";

const { height } = Dimensions.get("window");

export const FriendAddedModal = ({ show, close, userName, userId }) => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const { sb } = useSupabase();

  const [state, setState] = useState({
    opacity: new Animated.Value(0),
    container: new Animated.Value(height),
    modal: new Animated.Value(height),
  });

  const openModal = () => {
    Animated.sequence([
      Animated.timing(state.container, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(state.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(state.modal, {
        toValue: 0,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.sequence([
      Animated.timing(state.modal, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(state.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(state.container, {
        toValue: height,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (show) {
      openModal();
    } else {
      closeModal();
    }
  }, [show]);

  return (
    <Animated.View
      style={[
        styles.container,
        tw`bg-dark-background/50
        dark:bg-background/50
        `,
        {
          opacity: state.opacity,
          transform: [{ translateY: state.container }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.modal,
          tw`bg-background dark:bg-dark-background`,
          {
            transform: [{ translateY: state.modal }],
          },
        ]}
      >
        <View style={tw`py-10`}>
          <Text style={tw`h4`}>{t("settings:newFriendRequest")}</Text>
          <View
            style={tw`w-20 h-[0.6] rounded-full mt-2 bg-dark-background/10 dark:bg-background/15`}
          ></View>

          <View style={tw`flex-row items-center mt-1`}>
            <Image
              style={tw`w-20 h-20 rounded-full mt-4`}
              source={"https://i.pravatar.cc/50"}
            />
            <View style={tw`ml-4`}>
              <Text style={tw`h5`}>{userName}</Text>
              <Text style={tw`text-gray-500`}>@johndoe</Text>
            </View>
          </View>

          <View style={tw`flex-row justify-between mt-6`}>
            <Button
              onPress={async () => {
                await sb.from("friends").delete().eq("sender_id", userId);
                close();
              }}
              label={t("common:decline")}
              variant="destructive"
              icon={<XIcon size={20} color="white" />}
            />

            <Button
              onPress={async () => {
                await sb
                  .from("friends")
                  .update({ status: "accepted" })
                  .eq("sender_id", userId);
                close();
              }}
              label={t("common:accept")}
              icon={<CheckIcon size={20} color="white" />}
            />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
    position: "absolute",
    zIndex: 100,
  },
  modal: {
    bottom: 0,
    position: "absolute",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingLeft: 25,
    paddingRight: 25,
  },
});
