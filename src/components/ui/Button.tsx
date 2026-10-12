import type { ReactNode } from "react";
import { Pressable, type PressableProps, StyleSheet, Text, View } from "react-native";

import { colors, fonts, opacity, radius, space, touch } from "@/theme";

import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerOutline";
type ButtonSize = "md" | "lg";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
};

const palette: Record<
  ButtonVariant,
  { bg: string; pressed: string; text: string; ripple: string; border?: string }
> = {
  primary: {
    bg: colors.brandStrong,
    pressed: colors.brandStrongPressed,
    text: colors.onBrand,
    ripple: colors.brandStrongPressed,
  },
  secondary: {
    bg: colors.surface,
    pressed: colors.bg,
    text: colors.ink,
    ripple: colors.line,
    border: colors.line,
  },
  ghost: {
    bg: "transparent",
    pressed: colors.brandTint,
    text: colors.brandStrong,
    ripple: colors.brandTint,
  },
  danger: {
    bg: colors.danger,
    pressed: colors.dangerPressed,
    text: colors.onBrand,
    ripple: colors.dangerPressed,
  },
  dangerOutline: {
    bg: colors.surface,
    pressed: colors.dangerBg,
    text: colors.danger,
    ripple: colors.dangerBg,
    border: colors.danger,
  },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  ...rest
}: ButtonProps) {
  const tone = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.clip, fullWidth && styles.fullWidth, isDisabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        android_ripple={{ color: tone.ripple }}
        style={({ pressed }) => [
          styles.base,
          size === "lg" ? styles.lg : styles.md,
          { backgroundColor: pressed ? tone.pressed : tone.bg },
          tone.border ? [styles.outlined, { borderColor: tone.border }] : null,
        ]}
        {...rest}
      >
        {loading ? <Spinner color={tone.text} /> : icon}
        <Text
          numberOfLines={1}
          style={[styles.label, size === "lg" && styles.labelLg, { color: tone.text }]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { borderRadius: radius.control, overflow: "hidden", alignSelf: "flex-start" },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: opacity.disabled },
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.xl,
    borderRadius: radius.control,
  },
  md: { minHeight: touch.min },
  lg: { minHeight: touch.large, paddingHorizontal: space.xxl },
  outlined: { borderWidth: 1 },
  label: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  labelLg: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
});
