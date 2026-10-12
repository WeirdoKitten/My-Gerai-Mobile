import { StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Toggle } from "@/components/ui";
import { formatDateTime } from "@/lib/format/datetime";
import { colors, fonts, radius, space, type } from "@/theme";

import { useOpenStatus, useSetOpenState } from "./use-lapak";

/** Padanan OpenToggle web: kontrol harian buka/tutup Lapak, di atas antrean Pesanan. */
export function OpenStatusCard() {
  const status = useOpenStatus();
  const setOpen = useSetOpenState();
  if (!status.data) return null;

  const { isOpen, reopensAt } = status.data;
  const detail = isOpen
    ? "Siap menerima Pesanan baru"
    : reopensAt
      ? `Buka lagi ${formatDateTime(reopensAt)} sesuai jadwal`
      : "Tidak bisa menerima Pesanan baru";

  return (
    <View style={styles.wrap}>
      <View style={[styles.root, isOpen ? styles.open : styles.closed]}>
        <View style={[styles.dot, { backgroundColor: isOpen ? colors.success : colors.danger }]} />
        <View style={styles.text}>
          <Text style={type.bodyStrong}>
            Lapak{" "}
            <Text style={{ color: isOpen ? colors.success : colors.danger }}>
              {isOpen ? "Buka" : "Tutup"}
            </Text>
          </Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
        <Toggle
          value={isOpen}
          onValueChange={(next) => setOpen.mutate(next)}
          disabled={setOpen.isPending}
          label="Status buka atau tutup Lapak"
        />
      </View>
      {setOpen.error ? <Alert tone="error" message={errorMessage(setOpen.error)} /> : null}
    </View>
  );
}

const DOT = 12;

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  open: { backgroundColor: colors.successBg, borderColor: colors.success },
  closed: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  text: { flex: 1 },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
});
