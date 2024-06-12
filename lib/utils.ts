import { sb } from "@/context/SupabaseProvider";
import { Chat } from "./types";

import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { LatLng } from "react-native-maps";
import * as turf from "@turf/turf";
import { Tables } from "@/supabase/functions/_shared/supabase";
import { PostProps } from "@/components/Post";
import {
  ActionSheetOptions,
  useActionSheet,
} from "@expo/react-native-action-sheet";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { RnColorScheme } from "twrnc";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
}

export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = (
  { condition, wrapper, children },
) => {
  return condition ? wrapper(children) : children;
};

interface DualConditionalWrapperProps {
  condition: boolean;
  trueWrapper: (children: React.ReactNode) => JSX.Element;
  falseWrapper: (children: React.ReactNode) => JSX.Element;
  children: React.ReactNode;
}

export const DualConditionalWrapper: React.FC<DualConditionalWrapperProps> = (
  { condition, trueWrapper, falseWrapper, children },
) => {
  return condition ? trueWrapper(children) : falseWrapper(children);
};

export function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function showActionSheet(
  data: {
    showActionSheetWithOptions: (
      options: ActionSheetOptions,
      callback: (i?: number | undefined) => void | Promise<void>,
    ) => void;
    colorScheme: RnColorScheme;
  },
  options: ActionSheetOptions,
  callback: (i?: number | undefined) => void | Promise<void>,
) {
  data.showActionSheetWithOptions(
    {
      ...options,
      userInterfaceStyle: data.colorScheme === "dark" ? "dark" : "light",
    },
    callback,
  );
}

export function getOtherChatUsers(chat: Chat, user_id: string) {
  return chat.participants.filter(
    (participant) => participant.user.id !== user_id,
  );
}

export function getPostAttachmentSource(path: string, user_id: string) {
  return sb.storage.from("post_attachments").getPublicUrl(
    `${user_id}/${path}`,
  ).data.publicUrl;
}

export class PostUtils {
  static getPostAttachmentSource(path: string, user_id: string) {
    return sb.storage.from("post_attachments").getPublicUrl(
      `${user_id}/${path}`,
    ).data.publicUrl;
  }
  static turnPostIntoPostProps(
    post: Tables<"posts"> & { user: Tables<"users"> | null } & {
      attachments: Tables<"post_attachments">[];
    } & {
      tagged_users: {
        user: Tables<"users">;
      }[];
    },
  ): PostProps {
    return {
      id: post.id as string,
      author: {
        id: post.user?.id as string,
        name: post.user?.name as string,
      },
      text: post.text as string,
      attachments: post.attachments?.map((attachment) => ({
        caption: attachment.caption as string,
        path: attachment.path,
        media_type: attachment.media_type,
      })) || [],
      tagged_users: post.tagged_users?.map((taggedUser) => ({
        id: taggedUser.user?.id as string,
        name: taggedUser.user?.name as string,
      })) || [],
      location: LocationUtils.parseLocation(post.location as string),
      updated_at: new Date(post.updated_at),
      created_at: new Date(post.created_at),
    };
  }
}

export class DateUtils {
  static getYYYYMMDD(date: Date) {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  }
  static getDateDescription(date: Date, language: string) {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    };
    return date.toLocaleDateString(language, options);
  }
}

export class LocationUtils {
  static parseLocation(location: string) {
    if (!location) return null;
    return {
      latitude: parseFloat(location.split(",")[0].replace("(", "")),
      longitude: parseFloat(location.split(",")[1].replace(")", "")),
    };
  }
  static stringifyLocation(location: LatLng) {
    return `(${location.latitude},${location.longitude})`;
  }
  static async getLocationDetailedName(
    location: LatLng,
    userLanguage: string,
  ) {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${userLanguage}`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results[0].formatted_address;
  }
  static async getLocationName(
    location: LatLng,
    userLanguage: string,
  ) {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${userLanguage}&radius=100`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results[0].name;
  }
  static getPointsWithinPolygon(
    points: LatLng[],
    polygon: LatLng[],
  ) {
    const turfPolygon = turf.polygon([
      polygon.map((point) => [point.latitude, point.longitude]),
    ]);
    console.log(turfPolygon.bbox);
    const turfPoints = turf.featureCollection(
      points.map((point) =>
        turf.point([point.latitude, point.longitude], {
          latitude: point.latitude,
          longitude: point.longitude,
        })
      ),
    );

    const pointsWithinPolygon = turf.pointsWithinPolygon(
      turfPoints,
      turfPolygon,
    );

    return pointsWithinPolygon.features.map((feature) => {
      // const point = points.find((point) => point.latitude === feature.properties.latitude);
      return feature.properties;
    });
  }
}
