import React from "react";
import * as Location from "expo-location";

const LocationContext = React.createContext<{}>({});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return React.useContext(LocationContext);
}
