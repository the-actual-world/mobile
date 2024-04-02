import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/Text";
import { useTimer } from "@/context/TimerContext";
import { Timer } from "@/components/Timer";
import React from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import pt from "javascript-time-ago/locale/pt";

const TimeAgoContext = React.createContext<{
  timeAgo: TimeAgo | undefined;
}>({
  timeAgo: undefined,
});

export function TimeAgoProvider({ children }: { children: React.ReactNode }) {
  const [timeAgo, setTimeAgo] = React.useState<TimeAgo | undefined>();

  const { i18n } = useTranslation();

  React.useEffect(() => {
    TimeAgo.addLocale(en);
    TimeAgo.addLocale(pt);
    setTimeAgo(() => new TimeAgo(i18n.language === "pt" ? "pt-PT" : "en-US"));
  }, [i18n.language]);

  return (
    <TimeAgoContext.Provider value={{ timeAgo }}>
      {children}
    </TimeAgoContext.Provider>
  );
}

export function useTimeAgo() {
  const { timeAgo } = React.useContext(TimeAgoContext);
  if (!timeAgo) {
    throw new Error("useTimeAgo must be used within a TimeAgoProvider");
  }
  return timeAgo;
}
