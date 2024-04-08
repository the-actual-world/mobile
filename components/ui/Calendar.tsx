import { useColorScheme } from "@/context/ColorSchemeProvider";
import { fonts } from "@/lib/styles";
import tw from "@/lib/tailwind";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as RNCalendar,
  CalendarProps,
  LocaleConfig,
} from "react-native-calendars";

export default function Calendar(props: CalendarProps) {
  const { colorScheme } = useColorScheme();
  const { t, i18n } = useTranslation();

  LocaleConfig.locales.en = {
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthNamesShort: [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dec.",
    ],
    dayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    dayNamesShort: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  };

  LocaleConfig.locales.pt = {
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan.",
      "Fev.",
      "Mar.",
      "Abr.",
      "Mai.",
      "Jun.",
      "Jul.",
      "Ago.",
      "Set.",
      "Out.",
      "Nov.",
      "Dez.",
    ],
    dayNames: [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ],
    dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex", "Sáb."],
  };

  useEffect(() => {
    LocaleConfig.defaultLocale = i18n.language;
  }, [i18n.language]);

  return (
    <RNCalendar
      key={colorScheme + "-calendar"}
      {...props}
      style={[tw`w-full`, props.style]}
      theme={{
        textDayFontFamily: fonts.inter.regular,
        textMonthFontFamily: fonts.inter.regular,
        todayButtonFontFamily: fonts.inter.regular,
        textDayHeaderFontFamily: fonts.inter.regular,
        calendarBackground:
          colorScheme === "dark"
            ? tw.color("dark-background")
            : tw.color("background"),
        textSectionTitleColor:
          colorScheme === "dark"
            ? tw.color("dark-foreground")
            : tw.color("foreground"),
        monthTextColor:
          colorScheme === "dark"
            ? tw.color("dark-foreground")
            : tw.color("foreground"),
        dayTextColor:
          colorScheme === "dark"
            ? tw.color("dark-foreground")
            : tw.color("foreground"),
        textDisabledColor:
          colorScheme === "dark"
            ? tw.color("dark-muted-foreground")
            : tw.color("muted-foreground"),
        textInactiveColor:
          colorScheme === "dark"
            ? tw.color("dark-muted-foreground")
            : tw.color("muted-foreground"),
        dotColor:
          colorScheme === "dark"
            ? tw.color("dark-muted-foreground")
            : tw.color("muted-foreground"),
        todayTextColor: tw.color("accent"),
        arrowColor: tw.color("accent"),
        ...props.theme,
      }}
    />
  );
}
