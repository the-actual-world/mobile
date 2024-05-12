import tw from "@/lib/tailwind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { Text } from "../ui/Text";
import { useLocation } from "@/context/LocationProvider";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { useColorScheme } from "@/context/ColorSchemeProvider";

//@ts-ignore
// navigator.geolocation = require("expo-location");

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
  const [loading, setLoading] = React.useState(false);

  const { getLocation } = useLocation();
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();

  const inputRef = React.useRef<GooglePlacesAutocompleteRef | null>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const location = getLocation();

  return (
    <View style={tw`flex-1 mt-2`}>
      <GooglePlacesAutocomplete
        placeholder={t("location:search-location")}
        onPress={(data, details = null) => {
          onLocationSelect({
            latitude: details?.geometry.location.lat as number,
            longitude: details?.geometry.location.lng as number,
            name: data.description,
          });
          onClose();
        }}
        ref={inputRef}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: i18n.language,
        }}
        textInputProps={{
          placeholderTextColor:
            colorScheme === "dark"
              ? tw.color("dark-muted-foreground")
              : tw.color("muted-foreground"),
        }}
        styles={{
          textInput: tw`bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg px-4 py-2 text-foreground dark:text-dark-foreground w-full`,
          loader: tw`bg-background dark:bg-dark-background`,
          listView: tw`bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg mt-2`,
          row: tw`p-3 bg-muted dark:bg-dark-muted`,
          separator: tw`border-b border-border dark:border-dark-border`,
          description: tw`text-foreground dark:text-dark-foreground w-full`,
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={400}
        fetchDetails
        enablePoweredByContainer={false}
        // currentLocation
      />
    </View>
  );
}
