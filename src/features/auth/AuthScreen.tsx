import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, radius, space, type } from "@/theme";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  onBackPress?: ReactNode;
};

/** Kerangka layar sebelum login: judul di atas, isian di tengah, aksi utama di bawah (jangkauan ibu jari). */
export function AuthScreen({ title, subtitle, children, footer, onBackPress }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="height">
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onBackPress}
          <View style={styles.header}>
            <View style={styles.mark}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={28}
                color={colors.brandStrong}
              />
            </View>
            <Text style={type.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={type.caption}>{subtitle}</Text>
          </View>
          <View style={styles.form}>{children}</View>
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MARK = 56;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.xxxl,
    paddingBottom: space.xxl,
    gap: space.xxl,
  },
  header: { gap: space.xs },
  mark: {
    width: MARK,
    height: MARK,
    borderRadius: radius.card,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  form: { gap: space.lg },
  footer: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.xs,
    backgroundColor: colors.bg,
  },
});
