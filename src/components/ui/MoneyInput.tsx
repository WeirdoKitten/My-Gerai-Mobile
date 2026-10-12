import type { TextInputProps } from "react-native";

import { Input } from "./Input";

type MoneyInputProps = Omit<TextInputProps, "keyboardType" | "onChangeText"> & {
  value: string;
  onChangeText: (digits: string) => void;
  invalid?: boolean;
};

/** Isian Rupiah: hanya angka (tanpa titik). Pratinjau `Rp15.000` ditaruh di hint `Field`. */
export function MoneyInput({ value, onChangeText, ...rest }: MoneyInputProps) {
  return (
    <Input
      value={value}
      onChangeText={(text) => onChangeText(text.replace(/\D/g, ""))}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={9}
      {...rest}
    />
  );
}
