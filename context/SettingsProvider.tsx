import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Settings = {
  timeline: {
    snapToPosts: boolean;
    showScrollToTopButton: boolean;
    showUpAndDownButtons: boolean;
  };
  others: {
    showRelativeTime: boolean;
    previewLinks: boolean;
  };
};

const defaultSettings: Settings = {
  timeline: {
    snapToPosts: false,
    showScrollToTopButton: true,
    showUpAndDownButtons: false,
  },
  others: {
    showRelativeTime: true,
    previewLinks: true,
  },
};

const SettingsContext = React.createContext<{
  settings: Settings;
  setSetting: <K extends keyof Settings, V extends keyof Settings[K]>(
    category: K,
    key: V,
    value: Settings[K][V]
  ) => void;
  toggleSetting: <K extends keyof Settings, V extends keyof Settings[K]>(
    category: K,
    key: V
  ) => void;
}>({
  settings: defaultSettings,
  setSetting: () => {},
  toggleSetting: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);

  React.useEffect(() => {
    const fetchData = async () => {
      const settings =
        JSON.parse((await AsyncStorage.getItem("settings")) as string) ||
        defaultSettings;

      // add missing settings
      for (const category in defaultSettings) {
        //@ts-ignore
        for (const key in defaultSettings[category]) {
          if (!settings[category]?.[key]) {
            //@ts-ignore
            settings[category][key] = defaultSettings[category][key];
          }
        }
      }

      setSettings(settings as Settings);
    };
    fetchData();
  }, []);

  function setSetting<K extends keyof Settings, V extends keyof Settings[K]>(
    category: K,
    key: V,
    value: Settings[K][V]
  ) {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(newSettings);
    AsyncStorage.setItem("settings", JSON.stringify(newSettings));
  }

  function toggleSetting<K extends keyof Settings, V extends keyof Settings[K]>(
    category: K,
    key: V
  ) {
    setSetting(category, key, !settings[category][key] as Settings[K][V]);
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSetting,
        toggleSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return React.useContext(SettingsContext);
}
