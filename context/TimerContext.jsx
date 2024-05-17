import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TimerContext = createContext();
const TIMER_HISTORY_KEY = "timerHistory";

export function TimerProvider({ children }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  let interval = null;

  const getToday = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      const TODAY = getToday();
      const history =
        JSON.parse(await AsyncStorage.getItem(TIMER_HISTORY_KEY)) || {};
      const storedSeconds = history[TODAY] || 0;

      setSeconds(storedSeconds);
      setIsActive(true);
    })();
  }, []);

  useEffect(() => {
    clearInterval(interval);
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const updateStorage = async () => {
      if ((seconds % 15 === 0 || !isActive) && seconds > 0) {
        const TODAY = getToday();
        const history =
          JSON.parse(await AsyncStorage.getItem(TIMER_HISTORY_KEY)) || {};
        history[TODAY] = seconds;
        await AsyncStorage.setItem(TIMER_HISTORY_KEY, JSON.stringify(history));
      }
    };
    updateStorage();
  }, [seconds, isActive]);

  const enableTimer = () => {
    setIsActive(true);
  };

  const disableTimer = () => {
    setIsActive(false);
  };

  const resetTimer = async () => {
    const TODAY = getToday();
    const history =
      JSON.parse(await AsyncStorage.getItem(TIMER_HISTORY_KEY)) || {};
    history[TODAY] = 0;
    await AsyncStorage.setItem(TIMER_HISTORY_KEY, JSON.stringify(history));
    setSeconds(0);
  };

  return (
    <TimerContext.Provider
      value={{
        seconds,
        isActive,
        formattedString: `${
          Math.floor(seconds / 3600) > 0
            ? Math.floor(seconds / 3600)
                .toString()
                .padStart(2, "0") + ":"
            : ""
        }${Math.floor((seconds % 3600) / 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(seconds % 60)
          .toString()
          .padStart(2, "0")}`,
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
