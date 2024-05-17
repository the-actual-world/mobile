import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect } from "react";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { fonts } from "@/lib/styles";
import Calendar from "@/components/ui/Calendar";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetInput } from "@/components/ui/BottomSheetInput";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { BrainIcon, SaveIcon } from "lucide-react-native";
import { DateData } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import { useAlert } from "@/context/AlertProvider";
import { Tables } from "@/supabase/functions/_shared/supabase";
import MapView, { LatLng, MapPressEvent, Marker } from "react-native-maps";
import { LocationUtils } from "@/lib/utils";
import {
  PolygonEditor,
  getRandomPolygonColors,
  PolygonEditorRef,
  MapPolygonExtendedProps,
} from "@siposdani87/expo-maps-polygon-editor";
import { Alert } from "react-native";

const [strokeColor, fillColor] = getRandomPolygonColors();
const newPolygon: MapPolygonExtendedProps = {
  key: "NEW",
  coordinates: [],
  strokeWidth: 2,
  strokeColor,
  fillColor,
};

const mapStyles = {
  light: [],
  dark: [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#bdbdbd",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#181818",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1b1b1b",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#2c2c2c",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#8a8a8a",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        {
          color: "#373737",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#3c3c3c",
        },
      ],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [
        {
          color: "#4e4e4e",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#000000",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#3d3d3d",
        },
      ],
    },
  ],
};

export default function () {
  const { t } = useTranslation();
  const { session } = useSupabase();

  const alertRef = useAlert();

  const { colorScheme } = useColorScheme();

  const [postLocations, setPostLocations] = React.useState<
    { post_count: number; location: LatLng }[]
  >([]);

  async function getMyPostLocations() {
    const { data, error } = await sb.rpc("get_post_locations");

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      console.log("DATA: " + data);
      setPostLocations(
        data.map((location) => ({
          post_count: location.post_count,
          location: LocationUtils.parseLocation(location.location) as LatLng,
        }))
      );
    }
  }

  useEffect(() => {
    getMyPostLocations();
  }, []);

  // TODO: onclick, show either a bottom sheet with all the posts with that location or just redirect to the post page if there's only one post with that location

  const polygonEditorRef = React.useRef<PolygonEditorRef>(null);
  const mapRef = React.useRef<MapView>(null);

  const [polygons, setPolygons] = React.useState<MapPolygonExtendedProps[]>([]);

  const fitToCoordinates = (): void => {
    const coordinates = polygons.map((polygon) => polygon.coordinates).flat();
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  };

  const clickOnMap = ({ nativeEvent: { coordinate } }: MapPressEvent): void => {
    polygonEditorRef.current?.setCoordinate(coordinate);
  };

  const showNewPolygonInfo = (): void => {
    Alert.alert(
      "New polygon",
      "Click on the map 3 times to create starter polygon!",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        { text: "OK", onPress: createNewPolygon },
      ]
    );
  };

  const createNewPolygon = (): void => {
    const [strokeColor, fillColor] = getRandomPolygonColors();
    newPolygon.strokeColor = strokeColor;
    newPolygon.fillColor = fillColor;
    polygonEditorRef.current?.startPolygon();
  };

  const selectPolygonByIndex = (index: number): void => {
    polygonEditorRef.current?.selectPolygonByIndex(index);
  };

  const selectPolygonByKey = (key: string): void => {
    polygonEditorRef.current?.selectPolygonByKey(key);
  };

  const resetAll = (): void => {
    polygonEditorRef.current?.resetAll();
  };

  const getMarkersWithinPolygon = (): void => {
    const markers = LocationUtils.getPointsWithinPolygon(
      postLocations.map((post) => post.location),
      [...polygons[0].coordinates, polygons[0].coordinates[0]]
    );
    console.log("Markers within polygon", markers);
  };

  const onPolygonChange = (
    index: number,
    polygon: MapPolygonExtendedProps
  ): void => {
    console.log("onPolygonChange", index);
    const polygonsClone = [...polygons];
    polygonsClone[index] = polygon;
    setPolygons(polygonsClone);
  };

  const onPolygonCreate = (polygon: MapPolygonExtendedProps): void => {
    console.log("onPolygonCreate", newPolygon.key);
    const newKey = `key_${polygons.length + 1}`;
    const polygonClone = { ...polygon, key: newKey };
    const polygonsClone = [...polygons, polygonClone];
    setPolygons(polygonsClone);
    polygonEditorRef.current?.selectPolygonByKey(newKey);
  };

  const onPolygonRemove = (index: number): void => {
    console.log("onPolygonRemove", index);
    const polygonsClone = [...polygons];
    polygonsClone.splice(index, 1);
    setPolygons(polygonsClone);
  };

  const onPolygonSelect = (
    index: number,
    polygon: MapPolygonExtendedProps
  ): void => {
    console.log("onPolygonSelect", index, polygon.key);
  };

  const onPolygonUnselect = (
    index: number,
    polygon: MapPolygonExtendedProps
  ): void => {
    console.log("onPolygonUnselect", index, polygon.key);
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View style={tw`absolute top-0 left-0 right-0 z-10`}>
        <Button onPress={showNewPolygonInfo} label="New polygon" />
        <Button onPress={resetAll} label="Reset" />
        <Button onPress={fitToCoordinates} label="Fit to coordinates" />
        <Button
          onPress={getMarkersWithinPolygon}
          label="Get markers within polygon"
        />
      </View>
      <MapView
        style={[
          {
            width: "100%",
            height: "100%",
          },
          StyleSheet.absoluteFillObject,
        ]}
        onPress={clickOnMap}
        // dark mode
        customMapStyle={mapStyles[colorScheme || "light"]}
        ref={mapRef}
      >
        {postLocations.map((post) => (
          <Marker
            key={LocationUtils.formatLocation(post.location)}
            coordinate={post.location}
            onPress={() => {
              alertRef.current?.showAlert({
                title: "Post count",
                message: `${
                  post.post_count
                } posts at this location (${LocationUtils.formatLocation(
                  post.location
                )})`,
              });
            }}
            icon={{
              uri: `https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png`,
            }}
          />
        ))}
        <PolygonEditor
          ref={polygonEditorRef}
          polygons={polygons}
          newPolygon={newPolygon}
          onPolygonChange={onPolygonChange}
          onPolygonCreate={onPolygonCreate}
          onPolygonRemove={onPolygonRemove}
          onPolygonSelect={onPolygonSelect}
          onPolygonUnselect={onPolygonUnselect}
        />
      </MapView>
    </View>
  );
}
