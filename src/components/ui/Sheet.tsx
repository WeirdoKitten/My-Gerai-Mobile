import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, layout, radius, space, type } from "@/theme";

type SheetProps = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

/** Panel dari bawah layar untuk konfirmasi dan pilihan. Tombol kembali Android dan ketuk latar menutupnya. */
export function Sheet({ visible, title, description, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup"
        />
        <View style={[styles.panel, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.grabber} />
          <Text style={type.heading} accessibilityRole="header">
            {title}
          </Text>
          {description ? <Text style={type.caption}>{description}</Text> : null}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const GRABBER_WIDTH = 40;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.ink, opacity: 0.45 },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card + space.xs,
    borderTopRightRadius: radius.card + space.xs,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    gap: space.xs,
  },
  grabber: {
    alignSelf: "center",
    width: GRABBER_WIDTH,
    height: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    marginBottom: space.md,
  },
  body: { marginTop: space.lg, gap: space.md },
});
