import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [seconds, setSeconds] = useState(60 * 60);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const MAX_TIME = 60 * 60; // 1 hour in seconds
  const EXTRA_TIME = 5 * 60; // 5 minutes in seconds
  const TODAY = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      const storedDate = await AsyncStorage.getItem("lastActiveDate");
      const storedTime = await AsyncStorage.getItem("remainingTime");

      if (storedDate === TODAY && storedTime !== null) {
        setSeconds(parseInt(storedTime, 10));
        setIsActive(true);
      } else {
        await AsyncStorage.setItem("lastActiveDate", TODAY);
        setSeconds(MAX_TIME);
        setIsActive(true);
      }
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          const newSeconds = seconds - 1;
          AsyncStorage.setItem("remainingTime", newSeconds.toString());
          if (newSeconds <= 0) {
            clearInterval(interval);
            router.replace("/time-up");
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const segments = useSegments();
  useEffect(() => {
    if (
      (segments[2] && segments[2] === "settings") ||
      (segments[1] && segments[1] === "(auth)")
    ) {
      disableTimer();
    } else {
      enableTimer();
    }
  }, [segments]);

  const enableTimer = () => {
    setIsActive(true);
  };

  const disableTimer = () => {
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setSeconds(MAX_TIME);
    setIsActive(false);
    AsyncStorage.setItem("remainingTime", MAX_TIME.toString());
    AsyncStorage.setItem("lastActiveDate", TODAY);
  };

  return (
    <TimerContext.Provider
      value={{
        seconds,
        isActive,
        formattedString: `${Math.floor(seconds / 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(seconds % 60)
          .toString()
          .padStart(2, "0")}`,
        toggleTimer,
        enableTimer,
        disableTimer,
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
