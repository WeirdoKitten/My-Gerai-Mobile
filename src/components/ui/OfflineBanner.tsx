import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { useIsOnline } from "@/lib/network/use-is-online";
import { colors, fonts, radius, space } from "@/theme";

export function OfflineBanner() {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View style={styles.root} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <MaterialCommunityIcons name="wifi-off" size={18} color={colors.warning} />
      <Text style={styles.text}>Tidak ada koneksi. Data yang tampil adalah data terakhir.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.warning },
});
