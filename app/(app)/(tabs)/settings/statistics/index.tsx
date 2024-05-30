import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import React, { useEffect, useState } from "react";

import tw from "@/lib/tailwind";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { Background } from "@/components/Background";
import { useAlert } from "@/context/AlertProvider";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AvatarEdit from "@/components/EditAvatar";
import { Link } from "expo-router";
import { useTimer } from "@/context/TimerContext";
import { CartesianChart, Bar } from "victory-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { fonts } from "@/lib/styles";
import { useColorScheme } from "@/context/ColorSchemeProvider";

export default function Index() {
  const alertRef = useAlert();
  const { user } = useSupabase();
  const { t } = useTranslation();

  const [lastTenDaysData, setLastTenDaysData] = useState<
    { day: string; minutes: number }[]
  >([]);
  [];

  const font = useFont(Inter_400Regular, 12);

  const getToday = () => new Date().toISOString().split("T")[0];
  const getLastTenDays = () => {
    let days = [];
    let today = new Date();
    for (let i = 9; i >= 0; i--) {
      let pastDay = new Date(today);
      pastDay.setDate(pastDay.getDate() - i);
      days.push(pastDay.toISOString().split("T")[0]);
    }
    return days;
  };

  useEffect(() => {
    const fetchData = async () => {
      const history =
        JSON.parse((await AsyncStorage.getItem("timerHistory")) as string) ||
        {};
      const days = getLastTenDays();
      const data = days.map((day) => ({
        day: day,
        minutes: history[day] ? history[day] / 60 : 0,
      }));
      setLastTenDaysData(data);
    };
    fetchData();
  }, []);

  const { colorScheme } = useColorScheme();

  return (
    <Background>
      <Text
        style={[
          tw`text-2xl mb-1`,
          {
            fontFamily: fonts.inter.bold,
          },
        ]}
      >
        {t("settings:statistics")}
      </Text>
      <Text style={tw`text-lg mb-4`}>{t("settings:your-last-10-days")}</Text>
      <CartesianChart
        data={lastTenDaysData}
        xKey={"day"}
        yKeys={["minutes"]}
        axisOptions={{
          font,
          formatXLabel: (value) => {
            return value.split("-").slice(1).join("/");
          },
          formatYLabel: (value) => `${value}m`,
          lineColor:
            colorScheme === "dark"
              ? tw.color("muted-foreground")
              : tw.color("dark-muted-foreground"),
          labelColor:
            colorScheme === "dark"
              ? tw.color("dark-foreground")
              : tw.color("foreground"),
        }}
      >
        {({ points, chartBounds }) => (
          <Bar
            chartBounds={chartBounds}
            points={points.minutes}
            roundedCorners={{
              topLeft: 5,
              topRight: 5,
            }}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, 550)}
              colors={[tw.color("accent") as string, tw.color("accent") + "50"]}
            />
          </Bar>
        )}
      </CartesianChart>
      {/* Average */}
      <Text style={tw`text-lg mt-4`}>{t("settings:average")}</Text>
      <Text
        style={[
          tw`text-2xl`,
          {
            fontFamily: fonts.inter.bold,
          },
        ]}
      >
        {Math.round(
          lastTenDaysData.reduce((acc, curr) => acc + curr.minutes, 0) /
            lastTenDaysData.length
        )}
        m
      </Text>
    </Background>
  );
}
