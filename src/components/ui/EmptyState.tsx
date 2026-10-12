import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, space, type } from "@/theme";

type EmptyStateProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={32} color={colors.brandStrong} />
      </View>
      <Text style={[type.bodyStrong, styles.center]}>{title}</Text>
      {description ? <Text style={[type.caption, styles.center]}>{description}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const ICON_WRAP = 72;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    paddingVertical: space.xxxl * 1.5,
    paddingHorizontal: space.xxl,
    gap: space.sm,
  },
  iconWrap: {
    width: ICON_WRAP,
    height: ICON_WRAP,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  center: { textAlign: "center" },
  action: { marginTop: space.md, alignSelf: "stretch" },
});
