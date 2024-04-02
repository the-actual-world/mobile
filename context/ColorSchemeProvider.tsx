// ColorSchemeContext.js
import React, { createContext, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RnColorScheme, useAppColorScheme } from "twrnc";
import tw from "@/lib/tailwind";

const ColorSchemeContext = createContext(
  {} as {
    colorScheme: RnColorScheme;
    setColorScheme: React.Dispatch<React.SetStateAction<RnColorScheme>>;
    changeColorScheme: (newColorScheme: RnColorScheme) => void;
  }
);

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

export function ColorSchemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorScheme, toggleColorScheme, setColorScheme] =
    useAppColorScheme(tw);

  useEffect(() => {
    (async () => {
      const colorSchemeStored = await AsyncStorage.getItem("colorScheme");
      if (!colorSchemeStored) {
        return;
      }
      setColorScheme(colorSchemeStored as RnColorScheme);
    })();
  }, []);

  function changeColorScheme(newColorScheme: RnColorScheme) {
    if (newColorScheme === "light") {
      setColorScheme("light");
      AsyncStorage.setItem("colorScheme", "light");
    } else if (newColorScheme === "dark") {
      setColorScheme("dark");
      AsyncStorage.setItem("colorScheme", "dark");
    } else {
      if (colorScheme === "light") {
        setColorScheme("dark");
        AsyncStorage.setItem("colorScheme", "dark");
      } else {
        setColorScheme("light");
        AsyncStorage.setItem("colorScheme", "light");
      }
    }
  }

  return (
    <ColorSchemeContext.Provider
      value={
        {
          colorScheme,
          setColorScheme,
          changeColorScheme,
        } as {
          colorScheme: RnColorScheme;
          setColorScheme: React.Dispatch<React.SetStateAction<RnColorScheme>>;
          changeColorScheme: (newColorScheme: RnColorScheme) => void;
        }
      }
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}
