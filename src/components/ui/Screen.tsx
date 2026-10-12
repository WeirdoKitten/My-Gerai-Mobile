import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, space } from "@/theme";

import { OfflineBanner } from "./OfflineBanner";

type ScreenProps = {
  header: ReactNode;
  children: ReactNode;
};

/** Kerangka layar setelah login: header + penanda offline, lalu isi yang mengisi sisa layar. */
export function Screen({ header, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.top}>
        {header}
        <OfflineBanner />
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm, gap: space.md },
  body: { flex: 1 },
});
