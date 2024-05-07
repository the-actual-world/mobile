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

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export function random_uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

export class LocationUtils {
  static parseLocation(location: string) {
    if (!location) return null;
    return {
      latitude: parseFloat(location.split(",")[0].replace("(", "")),
      longitude: parseFloat(location.split(",")[1].replace(")", "")),
    };
  }
  static formatLocation(location: LatLng) {
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
  static async getPointsWithinPolygon(
    points: {
      id: string;
      location: LatLng;
    }[],
    polygon: LatLng[],
  ) {
    const turfPolygon = turf.polygon([
      polygon.map((point) => [point.latitude, point.longitude]),
    ]);
    console.log(turfPolygon.bbox);
    const turfPoints = turf.featureCollection(
      points.map((point) =>
        turf.point([point.location.latitude, point.location.longitude], {
          id: point.id,
        })
      ),
    );

    const pointsWithinPolygon = turf.pointsWithinPolygon(
      turfPoints,
      turfPolygon,
    );

    return pointsWithinPolygon.features.map((feature) => {
      const point = points.find((point) => point.id === feature.id);
      return point;
    });
  }
}
