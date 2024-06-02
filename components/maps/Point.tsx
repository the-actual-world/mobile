import React, { FunctionComponent, memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Marker as MapsMarker, Callout } from "react-native-maps";

import { isPointCluster, type supercluster } from "react-native-clusterer";
import { LocationUtils } from "@/lib/utils";
import tw from "@/lib/tailwind";
import {
  MapPinnedIcon,
  NotebookPenIcon,
  SquareAsteriskIcon,
} from "lucide-react-native";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

interface Props {
  item: IFeature;
  onPress: (item: IFeature) => void;
}

export const Point: FunctionComponent<Props> = memo(
  ({ item, onPress }) => {
    return (
      <MapsMarker
        coordinate={{
          latitude: item.geometry.coordinates[1],
          longitude: item.geometry.coordinates[0],
        }}
        title={`${item.properties.post_count} posts`}
        description={LocationUtils.formatLocation({
          latitude: item.geometry.coordinates[1],
          longitude: item.geometry.coordinates[0],
        })}
        onPress={() => onPress(item)}
        tracksViewChanges={false}
      >
        {item.properties?.cluster ? (
          <View
            style={tw`bg-primary rounded-md flex-row items-center justify-center gap-1 p-2`}
          >
            <Text style={tw`text-white font-bold`}>
              {item.properties.point_count}
            </Text>
            <MapPinnedIcon size={20} color={tw.color("text-white")} />
          </View>
        ) : (
          <View style={tw`bg-accent rounded-md flex-row gap-1 p-2`}>
            <Text>{item.properties.post_count}</Text>
            <NotebookPenIcon size={20} color={tw.color("foreground")} />
          </View>
        )}
      </MapsMarker>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.properties?.cluster_id ===
      nextProps.item.properties?.cluster_id &&
    prevProps.item.properties?.id === nextProps.item.properties?.id &&
    prevProps.item.properties?.point_count ===
      nextProps.item.properties?.point_count &&
    prevProps.item.properties?.onItemPress ===
      nextProps.item.properties?.onItemPress &&
    prevProps.item.properties?.getExpansionRegion ===
      nextProps.item.properties?.getExpansionRegion
);
