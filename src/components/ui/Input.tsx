import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { colors, fonts, radius, space, touch } from "@/theme";

type InputProps = TextInputProps & {
  invalid?: boolean;
  multiline?: boolean;
};

export function Input({
  invalid = false,
  multiline = false,
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.inkMuted}
      selectionColor={colors.brand}
      cursorColor={colors.brandStrong}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.base,
        multiline && styles.multiline,
        focused && styles.focused,
        invalid && styles.invalid,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch.min,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md + 2,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  multiline: { minHeight: 96, paddingVertical: space.md },
  focused: { borderColor: colors.brand, borderWidth: 2, paddingHorizontal: space.md + 1 },
  invalid: { borderColor: colors.danger },
});
