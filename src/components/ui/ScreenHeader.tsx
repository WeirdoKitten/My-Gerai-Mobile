import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, space, touch, type } from "@/theme";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.root}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          android_ripple={{ color: colors.line, borderless: true }}
          style={styles.back}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={styles.text}>
        <Text style={type.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={type.caption} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: touch.large,
  },
  back: {
    width: touch.min,
    height: touch.min,
    marginLeft: -space.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
});
