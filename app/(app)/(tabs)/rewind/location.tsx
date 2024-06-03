import { Dimensions, StyleSheet, View, Alert } from "react-native";
import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text } from "@/components/ui/Text";
import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  X,
  Search,
  MapPinIcon,
  XIcon,
  BoxSelectIcon,
  MapIcon,
  ScanSearchIcon,
  SquarePlusIcon,
  FullscreenIcon,
  SquareDashedMousePointerIcon,
  ZoomInIcon,
  SearchIcon,
} from "lucide-react-native";
import MapView, { MapPressEvent, LatLng, Region } from "react-native-maps";
import { LocationUtils } from "@/lib/utils";
import {
  Clusterer,
  isPointCluster,
  supercluster,
  useClusterer,
} from "react-native-clusterer";
import {
  PolygonEditor,
  getRandomPolygonColors,
  PolygonEditorRef,
  MapPolygonExtendedProps,
} from "@siposdani87/expo-maps-polygon-editor";
import { Point } from "@/components/maps/Point";
import { mapStyles } from "@/components/maps/mapStyles";
import DisplayPostsPer from "@/components/modal-content/DisplayPostsPerLocation";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";

const [strokeColor, fillColor] = getRandomPolygonColors();
const newPolygon: MapPolygonExtendedProps = {
  key: "NEW",
  coordinates: [],
  strokeWidth: 2,
  strokeColor,
  fillColor,
};

type IFeature = supercluster.PointOrClusterFeature<any, any>;

const OptimizedMapScreen = () => {
  const { t } = useTranslation();
  const { session } = useSupabase();

  const { colorScheme } = useColorScheme();

  const [postLocations, setPostLocations] = useState<
    { post_count: number; location: LatLng }[]
  >([]);

  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { width, height } = Dimensions.get("window");

  const points = useMemo(
    () =>
      postLocations.map((post) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [post.location.longitude, post.location.latitude],
        },
        properties: {
          location: LocationUtils.stringifyLocation(post.location),
          post_count: post.post_count,
        },
      })),
    [postLocations]
  );

  const [clusteredPoints, superCluster] = useClusterer(
    points,
    {
      width: width,
      height: height,
    },
    region
  );

  const getMyPostLocations = useCallback(async () => {
    const { data, error } = await sb.rpc("get_post_locations");

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setPostLocations(
        data.map((location) => ({
          post_count: location.post_count,
          location: LocationUtils.parseLocation(location.location) as LatLng,
        }))
      );
    }
  }, []);

  useEffect(() => {
    getMyPostLocations();
  }, [getMyPostLocations]);

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["80%"], []);
  const [selectedLocations, setSelectedLocations] = useState<LatLng[]>([]);

  const polygonEditorRef = useRef<PolygonEditorRef>(null);
  const mapRef = useRef<MapView>(null);

  const [polygons, setPolygons] = useState<MapPolygonExtendedProps[]>([]);

  const fitToCoordinates = useCallback((): void => {
    const coordinates = polygons.map((polygon) => polygon.coordinates).flat();
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }, [polygons]);

  const clickOnMap = useCallback(
    ({ nativeEvent: { coordinate } }: MapPressEvent): void => {
      polygonEditorRef.current?.setCoordinate(coordinate);
    },
    []
  );

  const showNewPolygonInfo = useCallback((): void => {
    Alert.alert(
      t("map:select-polygon-for-posts"),
      t("map:select-polygon-for-posts-info"),
      [
        {
          text: t("common:cancel"),
          onPress: () => {},
          style: "cancel",
        },
        { text: t("common:ok"), onPress: createNewPolygon },
      ]
    );
  }, []);

  const createNewPolygon = useCallback((): void => {
    if (polygons.length > 0) {
      resetAll();
    }
    // const [strokeColor, fillColor] = getRandomPolygonColors();
    const strokeColor = "#FF0000";
    const fillColor = "#FF000022";
    newPolygon.strokeColor = strokeColor;
    newPolygon.fillColor = fillColor;
    polygonEditorRef.current?.startPolygon();
  }, [polygons]);

  const resetAll = useCallback((): void => {
    polygonEditorRef.current?.resetAll();
    setPolygons([]);
  }, [polygons]);

  const getMarkersWithinPolygon = useCallback((): void => {
    if (polygons.length === 0) return;
    const markers = LocationUtils.getPointsWithinPolygon(
      postLocations.map((post) => post.location),
      [...polygons[0].coordinates, polygons[0].coordinates[0]]
    );

    bottomSheetModalRef.current?.present();
    setSelectedLocations(markers);
  }, [postLocations, polygons]);

  const onPolygonChange = useCallback(
    (index: number, polygon: MapPolygonExtendedProps): void => {
      setPolygons((prevPolygons) => {
        const polygonsClone = [...prevPolygons];
        polygonsClone[index] = polygon;
        return polygonsClone;
      });
    },
    []
  );

  const onPolygonCreate = useCallback(
    (polygon: MapPolygonExtendedProps): void => {
      const newKey = `key_${polygons.length + 1}`;
      const polygonClone = { ...polygon, key: newKey };
      setPolygons([polygonClone]);
      polygonEditorRef.current?.selectPolygonByKey(newKey);
    },
    []
  );

  const onPolygonRemove = useCallback((index: number): void => {
    setPolygons([]);
  }, []);

  const onPolygonSelect = useCallback(
    (index: number, polygon: MapPolygonExtendedProps): void => {
      console.log("onPolygonSelect", index, polygon.key);
    },
    []
  );

  const onPolygonUnselect = useCallback(
    (index: number, polygon: MapPolygonExtendedProps): void => {
      console.log("onPolygonUnselect", index, polygon.key);
    },
    []
  );

  const _handlePointPress = (point: IFeature): void => {
    // if (isPointCluster(point)) {
    //   setSelectedLocations(
    //     superCluster
    //       .getLeaves(point.properties.cluster_id, Infinity)
    //       .map((leaf) => ({
    //         latitude: leaf.geometry.coordinates[1],
    //         longitude: leaf.geometry.coordinates[0],
    //       }))
    //   );
    // } else {
    //   setSelectedLocations([
    //     {
    //       latitude: point.geometry.coordinates[1],
    //       longitude: point.geometry.coordinates[0],
    //     },
    //   ]);
    // }
  };

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={tw`absolute top-0 left-0 z-10 m-2 gap-2`}>
          {polygons.length === 0 ? (
            <Button size="icon" onPress={showNewPolygonInfo}>
              <SquareDashedMousePointerIcon size={20} color="white" />
            </Button>
          ) : (
            <Button size="icon" onPress={resetAll} variant="destructive">
              <XIcon size={20} color="white" />
            </Button>
          )}
          {polygons.length > 0 && (
            <Button size="icon" onPress={fitToCoordinates}>
              <ZoomInIcon size={20} color="white" />
            </Button>
          )}
        </View>
        <View style={tw`absolute top-0 right-0 z-10 m-2 gap-2`}>
          {polygons.length > 0 && (
            <Button size="icon" onPress={getMarkersWithinPolygon}>
              <SearchIcon size={20} color="white" />
            </Button>
          )}
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
          onRegionChange={(region) => setRegion(region)}
        >
          <Clusterer
            data={clusteredPoints}
            region={region}
            mapDimensions={{
              width: width,
              height: height,
            }}
            renderItem={(item) => (
              <Point
                key={
                  isPointCluster(item)
                    ? `cluster-${item.properties.cluster_id}`
                    : `point-${item.properties.location}`
                }
                item={item}
                onPress={_handlePointPress}
              />
            )}
          />
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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        backgroundStyle={tw`bg-bg border-t border-bd`}
        handleIndicatorStyle={tw`bg-mt-fg`}
        style={tw`py-4`}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            enableTouchThrough={false}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={[
              { backgroundColor: "rgba(0, 0, 0, 1)" },
              StyleSheet.absoluteFillObject,
            ]}
          />
        )}
      >
        <DisplayPostsPer locations={selectedLocations} />
      </BottomSheetModal>
    </>
  );
};

export default React.memo(OptimizedMapScreen);
