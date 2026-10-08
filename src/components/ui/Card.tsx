import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radius, shadow, space } from "@/theme";

type CardProps = ViewProps & {
  children: ReactNode;
  elevated?: boolean;
  /** Garis brand di sisi kiri untuk hal yang butuh perhatian, mis. Pesanan baru. */
  accent?: boolean;
};

export function Card({ children, elevated = false, accent = false, style, ...rest }: CardProps) {
  return (
    <View style={[styles.base, elevated ? shadow.card : styles.bordered, style]} {...rest}>
      {accent ? <View style={styles.accent} /> : null}
      {children}
    </View>
  );
}

const ACCENT_WIDTH = 5;

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.lg,
    overflow: "hidden",
  },
  bordered: { borderWidth: 1, borderColor: colors.line },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: ACCENT_WIDTH,
    backgroundColor: colors.brand,
  },
});
