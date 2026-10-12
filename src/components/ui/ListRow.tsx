import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, space, touch, type } from "@/theme";

type ListRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
};

/** Baris menu yang membuka layar lain (mis. Jadwal Operasional di Profil). */
export function ListRow({ icon, title, description, onPress }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.line }}
      style={styles.root}
    >
      <View style={styles.icon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.brandStrong} />
      </View>
      <View style={styles.text}>
        <Text style={type.bodyStrong}>{title}</Text>
        {description ? <Text style={type.caption}>{description}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.inkMuted} />
    </Pressable>
  );
}

const ICON = 40;

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: touch.large + space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
  },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: radius.control,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
});
