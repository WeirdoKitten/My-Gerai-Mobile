import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, space } from "@/theme";

import { OfflineBanner } from "./OfflineBanner";
import { ScreenHeader } from "./ScreenHeader";

type SubScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Aksi utama yang menempel di bawah layar. */
  footer?: ReactNode;
};

/** Kerangka layar turunan (dibuka dari tab): header dengan tombol kembali, isi, footer opsional. */
export function SubScreen({ title, subtitle, children, footer }: SubScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <ScreenHeader title={title} subtitle={subtitle} onBack={() => router.back()} />
        <OfflineBanner />
      </View>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm, gap: space.md },
  body: { flex: 1 },
  footer: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
