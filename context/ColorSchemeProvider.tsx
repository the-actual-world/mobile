// ColorSchemeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppColorScheme } from "twrnc";
import tw from "@/lib/tailwind";
import { useRouter } from "expo-router";

const ColorSchemeContext = createContext(
  {} as {
    colorScheme: "light" | "dark" | undefined;
    setColorScheme: React.Dispatch<
      React.SetStateAction<"light" | "dark" | undefined>
    >;
    changeColorScheme: (newColorScheme: "light" | "dark" | undefined) => void;
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
      setTimeout(() => {
        setColorScheme(colorSchemeStored as "light" | "dark");
      }, 1000);
    })();
  }, []);

  function changeColorScheme(newColorScheme: "light" | "dark" | undefined) {
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
          colorScheme: "light" | "dark" | undefined;
          setColorScheme: React.Dispatch<
            React.SetStateAction<"light" | "dark" | undefined>
          >;
          changeColorScheme: (
            newColorScheme: "light" | "dark" | undefined
          ) => void;
        }
      }
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}
