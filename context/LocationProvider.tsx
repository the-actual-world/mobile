import React from "react";
import * as Location from "expo-location";

const LocationContext = React.createContext<{
  getLocation: () => Promise<Location.LocationObject | null>;
}>({
  getLocation: async () => null,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);

  async function getLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  async function getLocation() {
    getLocationPermission();

    let location = await Location.getLastKnownPositionAsync({});
    setLocation(location);

    return location;
  }

  return (
    <LocationContext.Provider value={{ getLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return React.useContext(LocationContext);
}
