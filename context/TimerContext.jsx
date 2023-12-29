import { useSegments } from "expo-router";
import React, { createContext, useContext, useState, useEffect } from "react";

// const TimerContext = createContext(
//   {} as {
//     seconds: number;
//     isActive: boolean;
//     formattedString: string;
//     toggleTimer: () => void;
//     enableTimer: () => void;
//     disableTimer: () => void;
//     resetTimer: () => void;
//   }
// );
const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [seconds, setSeconds] = useState(60 * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = undefined;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  const segments = useSegments();
  useEffect(() => {
    console.log(segments);
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
    setSeconds(60 * 60);
    setIsActive(false);
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
