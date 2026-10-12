import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

type PerforationProps = {
  /** Padding kiri/kanan kartu induk, supaya coakan menempel ke tepi kartu. */
  insetLeft: number;
  insetRight: number;
};

// Sobekan tiket: garis putus-putus dengan coakan setengah lingkaran di kedua sisi kartu.
export function Perforation({ insetLeft, insetRight }: PerforationProps) {
  return (
    <View style={[styles.root, { marginLeft: -insetLeft, marginRight: -insetRight }]}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={styles.dashClip}>
        <View style={styles.dash} />
      </View>
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const NOTCH = 20;

const styles = StyleSheet.create({
  root: { height: NOTCH, justifyContent: "center" },
  notch: {
    position: "absolute",
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.bg,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashClip: { height: 1, overflow: "hidden", marginHorizontal: NOTCH },
  dash: { height: 2, borderWidth: 1, borderColor: colors.line, borderStyle: "dashed" },
});
