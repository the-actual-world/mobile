import * as React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui/Text";

import tw from "@/lib/tailwind";

export type ButtonVariantTypes =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "accent"
  | "ghost"
  | "link";

export interface IButtonProps
  extends React.ComponentProps<typeof TouchableOpacity> {
  children?: React.ReactNode;
  variant?: ButtonVariantTypes;
  size?: "default" | "sm" | "lg";
  label?: string | undefined;
  isLoading?: boolean;
  icon?: React.ReactNode;
  style?: any;
  disabled?: boolean;
}

export const Button = ({
  children,
  variant = "default",
  size = "default",
  label = undefined,
  isLoading = false,
  icon = null,
  disabled = false,
  style,
  ...props
}: IButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        tw`items-center justify-center rounded-md`,
        variant === "default" && tw`bg-primary dark:bg-dark-primary`,
        variant === "destructive" &&
          tw`bg-destructive dark:bg-dark-destructive`,
        variant === "outline" &&
          tw`border border-dark-input/40 dark:border-input/40`,
        variant === "secondary" && tw`bg-secondary dark:bg-dark-secondary`,
        variant === "accent" && tw`bg-accent dark:bg-dark-accent`,
        variant === "ghost" && tw``,
        variant === "link" && tw``,
        size === "default" && tw`h-10 px-4 py-2`,
        size === "sm" && tw`h-9 px-3 rounded-md`,
        size === "lg" && tw`h-11 px-8 rounded-md`,
        isLoading && tw`opacity-50`,
        disabled && tw`opacity-50`,
        style,
      ]}
      disabled={isLoading || disabled}
      {...props}
    >
      <View style={tw`flex-row items-center gap-2`}>
        {isLoading && <ActivityIndicator size={"small"} color={"black"} />}
        {icon && (
          <View style={tw`flex-row items-center justify-center`}>{icon}</View>
        )}
        {label && (
          <Text
            style={[
              variant === "default" &&
                tw`text-primary-foreground dark:text-dark-primary-foreground`,
              variant === "destructive" &&
                tw`text-destructive-foreground dark:text-dark-destructive-foreground`,
              variant === "secondary" &&
                tw`text-secondary-foreground dark:text-dark-secondary-foreground`,
              variant === "accent" && tw`text-background`,
              variant === "outline" &&
                tw`text-dark-input/70 dark:text-input/70`,
              variant === "ghost" &&
                tw`text-primary-foreground dark:text-dark-primary-foreground`,
              variant === "link" && tw`text-primary dark:text-dark-primary`,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
