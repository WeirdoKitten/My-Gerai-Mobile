import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { colors, layout, radius, space, type } from "@/theme";

const FALLBACK =
  "Pendaftaran Lapak kamu sedang ditinjau Admin. Silakan coba masuk lagi setelah disetujui.";

// Pesan datang apa adanya dari server lewat context, bukan parameter URL,
// supaya deep link tidak bisa menampilkan teks palsu di layar ini.
export default function WaitingScreen() {
  const { statusMessage: message } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.body}>
        <View style={styles.mark}>
          <MaterialCommunityIcons
            name="clipboard-clock-outline"
            size={36}
            color={colors.brandStrong}
          />
        </View>
        <Text style={type.title} accessibilityRole="header">
          Status Lapak
        </Text>
        <Text style={[type.body, styles.message]}>{message ?? FALLBACK}</Text>
      </View>
      <View style={styles.footer}>
        <Button
          label="Kembali ke Masuk"
          size="lg"
          fullWidth
          onPress={() =>
            router.canGoBack() ? router.dismissTo("/login") : router.replace("/login")
          }
        />
      </View>
    </SafeAreaView>
  );
}

const MARK = 80;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: layout.screenPaddingX },
  body: { flex: 1, justifyContent: "center", gap: space.md },
  mark: {
    width: MARK,
    height: MARK,
    borderRadius: radius.card + space.xs,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  message: { color: colors.inkMuted },
  footer: { paddingBottom: space.lg },
});
