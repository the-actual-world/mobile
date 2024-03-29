import tw from "@/lib/tailwind";
import { Text } from "./ui/Text";
import { useTimer } from "@/context/TimerContext";
import React from "react";

export const Timer = (props: {
  style?: React.ComponentProps<typeof Text>["style"];
}) => {
  const { seconds, formattedString, isActive } = useTimer();

  return (
    <Text
      style={[
        tw`text-foreground dark:text-dark-foreground text-xl mr-4`,
        {
          fontFamily: "CursedTimer",
        },
        !isActive && {
          opacity: 0.35,
        },
        props.style,
      ]}
    >{`${formattedString}`}</Text>
  );
};
