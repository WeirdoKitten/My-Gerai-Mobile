import { Switch } from "react-native";

import { colors } from "@/theme";

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Wajib: dibacakan pembaca layar karena switch tidak punya teks sendiri. */
  label: string;
  disabled?: boolean;
};

// Switch bawaan Android (terasa native, area sentuh 48) dengan warna token.
export function Toggle({ value, onValueChange, label, disabled = false }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={label}
      trackColor={{ false: colors.line, true: colors.brand }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.line}
    />
  );
}
