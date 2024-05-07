import React, { useCallback } from "react";
import { Text } from "@/components/ui/Text";

import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
} from "react-native-reanimated";

import tw from "@/lib/tailwind";

export type AlertVariants = "default" | "destructive" | "info";

export interface IAlertProps {
  variant?: AlertVariants;
  title?: string;
  message?: string;
  duration?: number;
}

export const Alert = React.forwardRef(({}, ref) => {
  const translateY = useSharedValue<number>(-100);
  const [isShown, setIsShown] = React.useState<boolean>(false);
  const [variant, setVariant] = React.useState<AlertVariants>("default");
  const [title, setTitle] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [duration, setDuration] = React.useState<number>(3000);

  const showAlert = useCallback(
    ({ variant, title, message, duration }: IAlertProps) => {
      setVariant(variant ? variant : "default");
      setTitle(title ? title : "");
      setMessage(message ? message : "");
      setDuration(duration ? duration : 3000);
      setIsShown(true);
      translateY.value = withSequence(
        withTiming(60),
        withDelay(
          duration ? duration : 3000,
          withTiming(-100, undefined, (finish) => {
            if (finish) {
              runOnJS(setIsShown)(false);
            }
          })
        )
      );
    },
    [translateY]
  );

  React.useImperativeHandle(
    ref,
    () => ({
      showAlert,
    }),
    [showAlert]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: translateY.value,
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (event.translationY < 100) {
        translateY.value = withSpring(ctx.startY + event.translationY, {
          damping: 600,
          stiffness: 100,
        });
      }
    },
    onEnd: (event) => {
      if (event.translationY < 0) {
        translateY.value = withTiming(-100, undefined, (finish) => {
          if (finish) {
            runOnJS(setIsShown)(false);
          }
        });
      } else if (event.translationY > 0) {
        translateY.value = withSequence(
          withTiming(60),
          withDelay(
            duration,
            withTiming(-100, undefined, (finish) => {
              if (finish) {
                runOnJS(setIsShown)(false);
              }
            })
          )
        );
      }
    },
  });

  return (
    <>
      {isShown && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              tw`absolute w-full rounded-lg border border-border dark:border-dark-border p-4`,
              {
                zIndex: 100,
              },
              variant === "default" && tw`bg-dark-accent dark:bg-accent`,
              variant === "destructive" &&
                tw`border-destructive dark:border-dark-destructive bg-background dark:bg-dark-background`,
              variant === "info" && tw`bg-info dark:bg-dark-info`,
              animatedStyle,
            ]}
          >
            {title && (
              <Text
                style={[
                  tw`text-base text-foreground dark:text-dark-foreground font-medium tracking-tight mb-1 font-bold`,
                  variant === "default" &&
                    tw`text-background dark:text-dark-background`,
                  variant === "destructive" &&
                    tw`text-destructive dark:text-dark-destructive`,
                  variant === "info" &&
                    tw`text-background dark:text-dark-background`,
                ]}
              >
                {title}
              </Text>
            )}
            <Text
              style={[
                tw`text-sm text-foreground dark:text-dark-foreground`,
                variant === "default" &&
                  tw`text-background dark:text-dark-background`,
                variant === "destructive" &&
                  tw`text-destructive dark:text-dark-destructive`,
                variant === "info" &&
                  tw`text-background dark:text-dark-background`,
              ]}
            >
              {message}
            </Text>
          </Animated.View>
        </PanGestureHandler>
      )}
    </>
  );
});
