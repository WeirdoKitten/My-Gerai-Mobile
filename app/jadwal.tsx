import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "@/api/error-message";
import { type OpenStatus, operatingHoursInputSchema } from "@/api/schemas/lapak";
import { Alert, Button, ScreenHeader, Spinner, TimeField, Toggle } from "@/components/ui";
import { useOpenStatus, useSaveOperatingHours } from "@/features/lapak/use-lapak";
import { formatDateTime } from "@/lib/format/datetime";
import { colors, fonts, layout, radius, space, type } from "@/theme";

// Indeks = dayOfWeek konvensi Postgres (0 = Minggu), sama dengan web. Tampilan mulai Senin.
const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type DayEntry = { enabled: boolean; openTime: string; closeTime: string };

function buildEntries(hours: OpenStatus["hours"]): DayEntry[] {
  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]));
  return DAY_LABELS.map((_, day) => {
    const row = byDay.get(day);
    return row
      ? { enabled: true, openTime: row.openTime.slice(0, 5), closeTime: row.closeTime.slice(0, 5) }
      : { enabled: false, openTime: "09:00", closeTime: "17:00" };
  });
}

export default function ScheduleScreen() {
  const status = useOpenStatus();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ScreenHeader title="Jadwal Operasional" onBack={() => router.back()} />
      </View>
      {status.data ? (
        <ScheduleForm key={status.dataUpdatedAt} status={status.data} />
      ) : status.error ? (
        <View style={styles.content}>
          <Alert tone="error" message={errorMessage(status.error)} />
        </View>
      ) : (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

function ScheduleForm({ status }: { status: OpenStatus }) {
  const [entries, setEntries] = useState(() => buildEntries(status.hours));
  const [error, setError] = useState<string | null>(null);
  const save = useSaveOperatingHours();

  const update = (day: number, patch: Partial<DayEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === day ? { ...e, ...patch } : e)));
    setError(null);
  };

  function submit() {
    const rows = entries
      .map((entry, dayOfWeek) => ({ dayOfWeek, ...entry }))
      .filter((entry) => entry.enabled)
      .map(({ dayOfWeek, openTime, closeTime }) => ({ dayOfWeek, openTime, closeTime }));
    const parsed = operatingHoursInputSchema.safeParse(rows);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa lagi jadwalnya.");
      return;
    }
    save.mutate(parsed.data);
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.caption}>
          Kalau jadwal sudah diatur, status buka/tutup mengikutinya otomatis. Tidak perlu ubah
          status manual tiap hari.
        </Text>
        <Alert
          tone={status.isOpen ? "success" : "warning"}
          message={`Status saat ini: ${status.isOpen ? "Buka" : "Tutup"}${
            !status.isOpen && status.reopensAt
              ? `, buka lagi ${formatDateTime(status.reopensAt)}`
              : ""
          }`}
        />
        <View style={styles.days}>
          {DISPLAY_ORDER.map((day, index) => {
            const entry = entries[day];
            const label = DAY_LABELS[day];
            if (!entry || !label) return null;
            return (
              <View key={label} style={[styles.day, index > 0 && styles.dayBorder]}>
                <View style={styles.dayHead}>
                  <Toggle
                    value={entry.enabled}
                    onValueChange={(enabled) => update(day, { enabled })}
                    label={`Buka hari ${label}`}
                  />
                  <Text style={[styles.dayName, !entry.enabled && styles.dayOff]}>{label}</Text>
                </View>
                {entry.enabled ? (
                  <View style={styles.times}>
                    <TimeField
                      value={entry.openTime}
                      onChange={(openTime) => update(day, { openTime })}
                      label={`Jam buka ${label}`}
                    />
                    <Text style={type.caption}>sampai</Text>
                    <TimeField
                      value={entry.closeTime}
                      onChange={(closeTime) => update(day, { closeTime })}
                      label={`Jam tutup ${label}`}
                    />
                  </View>
                ) : (
                  <Text style={[type.caption, styles.closedText]}>Tutup</Text>
                )}
              </View>
            );
          })}
        </View>
        <Text style={type.micro}>
          Jam tutup lebih kecil dari jam buka berarti buka sampai lewat tengah malam.
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        {error || save.error ? (
          <Alert tone="error" message={error ?? errorMessage(save.error)} />
        ) : null}
        <Button
          label="Simpan Jadwal"
          size="lg"
          fullWidth
          loading={save.isPending}
          onPress={submit}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  days: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  day: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingLeft: space.sm,
    paddingRight: space.md,
    paddingVertical: space.sm,
    minHeight: 64,
  },
  dayBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  dayHead: { flexDirection: "row", alignItems: "center", gap: space.xs },
  dayName: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.ink },
  dayOff: { color: colors.inkMuted },
  times: { flexDirection: "row", alignItems: "center", gap: space.sm },
  closedText: { paddingRight: space.sm },
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
