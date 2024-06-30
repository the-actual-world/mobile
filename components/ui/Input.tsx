import * as React from "react";
import { TextInput, View } from "react-native";
import { Text } from "@/components/ui/Text";

import tw from "@/lib/tailwind";
import { useColorScheme } from "@/context/ColorSchemeProvider";

export interface IInputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  text?: string;
  errors?: string | any;
  isFocused?: boolean;
  onBlur?: (event: any) => void;
  disabled?: boolean;
  onInputClear?: () => void;
  style?: any;
}

export const Input = ({
  label,
  text,
  errors,
  onBlur,
  disabled,
  style,
  onInputClear,
  ...props
}: IInputProps) => {
  const { colorScheme } = useColorScheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputHeight, setInputHeight] = React.useState(0);
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur && onBlur(event);
  };

  React.useEffect(() => {
    if (props.value === "") {
      setInputHeight(0);
    }
  }, [props.value]);

  const handleContentSizeChange = (event: any) => {
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const handleSelectionChange = (event: any) => {
    setSelection(event.nativeEvent.selection);
  };

  const handleChangeText = (text: string) => {
    const start = selection.start + 1; // Adjusting the start index
    const newSelection = { start: start, end: start };
    setSelection(newSelection);
    props.onChangeText && props.onChangeText(text);
  };

  return (
    <View style={style}>
      {label && (
        <Text
          style={tw`text-xs text-foreground dark:text-dark-foreground self-start mb-1.5`}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          tw`h-10 flex w-full items-center rounded-md text-foreground dark:text-dark-foreground border border-input dark:border-dark-input bg-transparent px-3 py-2 text-sm`,
          isFocused && tw`border-primary dark:border-dark-primary`,
          errors && tw`border-destructive dark:border-dark-destructive`,
          disabled && tw`text-muted-foreground dark:text-dark-muted-foreground`,
          props.multiline && inputHeight > 0 && { height: inputHeight },
        ]}
        onContentSizeChange={
          props.multiline ? handleContentSizeChange : undefined
        }
        editable={!disabled}
        placeholderTextColor={
          colorScheme === "dark"
            ? tw.color("dark-muted-foreground")
            : tw.color("muted-foreground")
        }
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onSelectionChange={handleSelectionChange}
        selection={selection}
        onChangeText={handleChangeText}
        {...props}
      />
      {text && <Text style={tw`muted self-start mt-1.5`}>{text}</Text>}
      {errors && (
        <Text
          style={tw`text-sm text-destructive dark:text-dark-destructive self-start mt-1`}
        >
          {errors}
        </Text>
      )}
    </View>
  );
};
