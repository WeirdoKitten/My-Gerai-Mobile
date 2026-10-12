import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, opacity, radius, space, touch } from "@/theme";

type TimeFieldProps = {
  /** "HH:mm" */
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
};

function toDate(value: string): Date {
  const [h, m] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0, 0, 0);
  return date;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Tombol jam ("09:00") yang membuka pemilih jam bawaan Android, format 24 jam. */
export function TimeField({ value, onChange, label, disabled = false }: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    setOpen(false);
    if (event.type === "set" && date) onChange(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        android_ripple={{ color: colors.line }}
        style={[styles.root, disabled && styles.disabled]}
      >
        <Text style={styles.value}>{value.replace(":", ".")}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker value={toDate(value)} mode="time" is24Hour onChange={handleChange} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: touch.min,
    minWidth: 84,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  disabled: { opacity: opacity.disabled },
  value: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
});
