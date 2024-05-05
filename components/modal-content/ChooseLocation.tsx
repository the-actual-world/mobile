import tw from "@/lib/tailwind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { Text } from "../ui/Text";

export default function ChooseLocationModalContent({
  onClose,
  onLocationSelect,
}: {
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    name: string;
  }) => void;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    { latitude: number; longitude: number; name: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const search = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();
    setLoading(false);

    setSearchResults(
      data.features.map((feature: any) => ({
        latitude: feature.center[1],
        longitude: feature.center[0],
        name: feature.place_name,
      }))
    );
  };

  return (
    <View style={tw`flex-1`}>
      <View style={tw`flex-row items-center justify-between`}>
        <TextInput
          style={tw`flex-1 p-2 text-lg`}
          placeholder={t("location:search-location")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onEndEditing={() => search(searchQuery)}
        />
        <TouchableOpacity onPress={onClose}>
          <Text style={tw`text-lg text-mt-fg`}>{t("common:cancel")}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={tw`mt-4`} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`p-2`}
              onPress={() => {
                onLocationSelect(item);
                onClose();
              }}
            >
              <Text style={tw`text-lg`}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
