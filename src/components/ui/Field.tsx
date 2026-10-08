import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, space, type } from "@/theme";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <View style={styles.root}>
      <Text style={type.label}>{label}</Text>
      {children}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={type.micro}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm - 2 },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.danger },
});
