import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useSupabase } from "./useSupabase";

const NotificationsContext = createContext({
  expoPushToken: "",
  notification: null as Notifications.Notification | null,
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
    console.log(token);
  } else {
    console.error("Must use physical device for Push Notifications");
  }

  return token?.data;
}

export function NotificationsProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { sb, session } = useSupabase();
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] =
    React.useState<Notifications.Notification | null>(null);
  const notificationListener = React.useRef<
    Notifications.Subscription | undefined
  >();
  const responseListener = React.useRef<
    Notifications.Subscription | undefined
  >();
  const router = useRouter();

  React.useEffect(() => {
    if (!session) return;

    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token as string);

      console.log("Token", token);
      console.log("Session", session.user?.id);

      const { error } = await sb.from("user_notifications").upsert([
        {
          push_token: token as string,
        },
      ]);

      if (error) {
        console.error(error);
      }
    });
  }, [session]);

  React.useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("--------- GOT A NOTIFICATION!!! ---------");
        console.log(response);

        setTimeout(() => {
          const toScreen =
            response.notification.request.content.data["toScreen"];
          if (toScreen) {
            router.push(toScreen);
          }
        }, 500);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current as Notifications.Subscription
      );

      Notifications.removeNotificationSubscription(
        responseListener.current as Notifications.Subscription
      );
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
