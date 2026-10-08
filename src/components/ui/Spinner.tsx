import { ActivityIndicator } from "react-native";

import { colors } from "@/theme";

type SpinnerProps = {
  size?: "small" | "large";
  color?: string;
  label?: string;
};

export function Spinner({
  size = "small",
  color = colors.brandStrong,
  label = "Memuat",
}: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} accessibilityLabel={label} />;
}
