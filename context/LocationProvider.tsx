import React from "react";
import * as Location from "expo-location";

const LocationContext = React.createContext<{
  location: Location.LocationObject | null;
}>({
  location: null,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);

  async function getLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return false;
    }
    return true;
  }

  async function getLocation() {
    const hasPermission = await getLocationPermission();
    if (!hasPermission) return;

    let location = await Location.getLastKnownPositionAsync({});
    console.log("SET LOCATION: " + JSON.stringify(location));
    setLocation(location);
  }

  React.useEffect(() => {
    getLocation();
  }, []);

  React.useEffect(() => {
    console.log("LOCATION: " + JSON.stringify(location));
  });

  return (
    <LocationContext.Provider value={{ location }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return React.useContext(LocationContext);
}
