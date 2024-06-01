import React, { FunctionComponent, memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Marker as MapsMarker, Callout } from "react-native-maps";

import { isPointCluster, type supercluster } from "react-native-clusterer";
import { LocationUtils } from "@/lib/utils";

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
            style={{
              backgroundColor: "red",
              width: 30,
              height: 30,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{item.properties.point_count}</Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "blue",
              width: 30,
              height: 30,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{item.properties.post_count}</Text>
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
