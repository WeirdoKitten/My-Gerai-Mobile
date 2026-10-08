import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, space } from "@/theme";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: colors.neutralBg, fg: colors.inkMuted },
  primary: { bg: colors.brandTint, fg: colors.brandStrong },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  /** Titik warna di depan label; dipakai untuk status supaya terbaca sekali lirik. */
  dot?: boolean;
};

export function Badge({ label, tone = "neutral", dot = false }: BadgeProps) {
  const { bg, fg } = toneColors[tone];
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const DOT_SIZE = 7;

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space.xs + 2,
    borderRadius: radius.pill,
    paddingHorizontal: space.md - 2,
    paddingVertical: space.xs,
  },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: radius.pill },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});
