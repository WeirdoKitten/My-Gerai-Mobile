import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, space } from "@/theme";

type AlertTone = "info" | "success" | "warning" | "error";

const toneStyle: Record<
  AlertTone,
  { bg: string; fg: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  info: { bg: colors.infoBg, fg: colors.info, icon: "information-outline" },
  success: { bg: colors.successBg, fg: colors.success, icon: "check-circle-outline" },
  warning: { bg: colors.warningBg, fg: colors.warning, icon: "alert-outline" },
  error: { bg: colors.dangerBg, fg: colors.danger, icon: "alert-circle-outline" },
};

type AlertProps = {
  tone?: AlertTone;
  title?: string;
  message: string;
};

export function Alert({ tone = "info", title, message }: AlertProps) {
  const { bg, fg, icon } = toneStyle[tone];
  return (
    <View
      accessibilityRole={tone === "error" ? "alert" : "summary"}
      style={[styles.root, { backgroundColor: bg }]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={fg} style={styles.icon} />
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: fg }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: fg }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: space.md - 2,
    borderRadius: radius.control,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.md,
  },
  icon: { marginTop: 1 },
  body: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  message: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
});
