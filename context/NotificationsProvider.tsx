import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { sb, useSupabase } from "./SupabaseProvider";

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
      // CHANGED THIS
      projectId: Constants.expoConfig?.extra?.eas.projectId,
    });
    console.log(token);
  } else {
    // console.error("Must use physical device for Push Notifications");
  }

  return token?.data;
}

function useNotificationObserver(
  notification: Notifications.Notification | null,
  setNotification: React.Dispatch<Notifications.Notification | null>
) {
  const router = useRouter();
  const notificationListener = React.useRef<Notifications.Subscription>();
  const responseListener = React.useRef<Notifications.Subscription>();
  const [authenticatedUrlToRedirectTo, setAuthenticatedUrlToRedirectTo] =
    useState<string | null>(null);
  const { isLoggedIn } = useSupabase();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  const onNotificationResponse = React.useCallback(
    (response: null | Notifications.NotificationResponse) => {
      if (!response) return;

      console.log("Notification Response", response.notification);

      setAuthenticatedUrlToRedirectTo(
        response.notification.request.content.data.toScreen
      );
    },
    []
  );

  React.useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        onNotificationResponse
      );

    Notifications.getLastNotificationResponseAsync().then(
      onNotificationResponse
    );

    return () => {
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [onNotificationResponse]);

  useEffect(() => {
    if (
      lastNotificationResponse?.actionIdentifier ===
      Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      onNotificationResponse(lastNotificationResponse);
    }
  }, [lastNotificationResponse]);

  useEffect(() => {
    console.log("Notification", notification);
    console.log("Authenticated URL", authenticatedUrlToRedirectTo);
    if (authenticatedUrlToRedirectTo && isLoggedIn) {
      setTimeout(() => {
        router.push(authenticatedUrlToRedirectTo);
        setAuthenticatedUrlToRedirectTo(null);
      }, 1000);
    }
  }, [authenticatedUrlToRedirectTo, isLoggedIn]);
}

export function NotificationsProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { session } = useSupabase();
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] =
    React.useState<Notifications.Notification | null>(null);

  React.useEffect(() => {
    if (!session) return;

    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token as string);

      // console.log("Token", token);
      // console.log("Session", session.user?.id);

      const { error } = await sb.from("user_notifications").upsert([
        {
          push_token: token as string,
        },
      ]);

      // if (error) {
      //   console.error(error);
      // }
    });
  }, [session]);

  useNotificationObserver(notification, setNotification);

  return (
    <NotificationsContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
