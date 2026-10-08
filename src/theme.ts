import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  bg: "#FAF6F1",
  surface: "#FFFFFF",
  ink: "#1C1917",
  inkMuted: "#78716C",
  line: "#EAE3DB",
  brand: "#EA580C",
  brandStrong: "#C2410C",
  brandStrongPressed: "#9A3412",
  brandTint: "#FFF1E7",
  success: "#15803D",
  successBg: "#F0FDF4",
  warning: "#B45309",
  warningBg: "#FEF3C7",
  danger: "#DC2626",
  dangerPressed: "#B91C1C",
  dangerBg: "#FEF2F2",
  info: "#1D4ED8",
  infoBg: "#EFF6FF",
  neutralBg: "#F4F1EC",
  onBrand: "#FFFFFF",
} as const;

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

const tabularNums: TextStyle["fontVariant"] = ["tabular-nums"];

export const type = {
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: colors.ink },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: colors.ink },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  micro: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.inkMuted },
  orderCode: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 4,
    color: colors.ink,
    fontVariant: tabularNums,
  },
  amount: { fontFamily: fonts.semibold, fontVariant: tabularNums, color: colors.ink },
} as const satisfies Record<string, TextStyle>;

export const radius = { card: 16, control: 12, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const layout = { screenPaddingX: space.lg } as const;

export const touch = { min: 48, large: 56 } as const;

export const shadow = {
  card: {
    elevation: 3,
    shadowColor: colors.brand,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
} as const satisfies Record<string, ViewStyle>;

export const opacity = { disabled: 0.6 } as const;

export const theme = {
  colors,
  fonts,
  type,
  radius,
  space,
  layout,
  touch,
  shadow,
  opacity,
} as const;
