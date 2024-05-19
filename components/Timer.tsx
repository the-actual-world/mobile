import tw from "@/lib/tailwind";
import { Text } from "./ui/Text";
import { useTimer } from "@/context/TimerContext";
import React from "react";
import { fonts } from "@/lib/styles";

export const Timer = (props: {
  style?: React.ComponentProps<typeof Text>["style"];
}) => {
  const { formattedString, isActive } = useTimer();

  return (
    <Text
      style={[
        tw`text-foreground dark:text-dark-foreground text-xl mr-4`,
        {
          fontFamily: fonts.cursedTimer.regular,
        },
        !isActive && {
          opacity: 0.35,
        },
        props.style,
      ]}
    >{`${formattedString}`}</Text>
  );
};
