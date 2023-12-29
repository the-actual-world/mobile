import React from "react";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/context/ColorSchemeProvider";

export default function MyStatusBar() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />;
}
