import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQueryClient } from "@tanstack/react-query";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, space, touch, type } from "@/theme";

import { askPushPermission, usePushPermission } from "./PushManager";

/**
 * Di atas antrean selama izin notifikasi belum ada: Pesanan baru tidak akan berbunyi.
 * "Nyalakan" meminta izin kalau Android masih mengizinkan, kalau tidak membuka Pengaturan.
 * Status diperiksa ulang saat Pedagang kembali ke aplikasi.
 */
export function PushDeniedBanner() {
  const queryClient = useQueryClient();
  const permission = usePushPermission();
  if (!permission.data || permission.data === "granted") return null;
  const turnOn = () =>
    permission.data === "ask" ? void askPushPermission(queryClient) : void Linking.openSettings();
  return (
    <View style={styles.root} accessibilityRole="alert">
      <MaterialCommunityIcons name="bell-off-outline" size={22} color={colors.warning} />
      <View style={styles.text}>
        <Text style={styles.title}>Notifikasi Pesanan mati</Text>
        <Text style={type.caption}>Pesanan baru tidak berbunyi saat HP terkunci.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={turnOn}
        android_ripple={{ color: colors.warningBg }}
        style={styles.action}
      >
        <Text style={styles.actionText}>Nyalakan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningBg,
  },
  text: { flex: 1 },
  title: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.warning },
  action: {
    minHeight: touch.min,
    paddingHorizontal: space.md,
    justifyContent: "center",
    borderRadius: radius.control,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 15, color: colors.brandStrong },
});
