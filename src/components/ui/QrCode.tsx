import QRCode from "qrcode";
import { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";

import { colors } from "@/theme";

/** Zona kosong di tepi QR (modul), sesuai standar supaya mudah dipindai. */
const QUIET_ZONE = 4;

type QrCodeProps = {
  /** Isi QR mentah dari server (mis. payload QRIS). */
  value: string;
  size: number;
  accessibilityLabel: string;
};

/** Path SVG satu modul per kotak; dipisah supaya bisa diuji tanpa render. */
export function qrPath(value: string): { path: string; count: number } {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const parts: string[] = [];
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) {
        parts.push(`M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`);
      }
    }
  }
  return { path: parts.join(""), count: modules.size + QUIET_ZONE * 2 };
}

/** QR tajam di ukuran berapa pun, digambar di HP dari isi QR (bukan gambar kecil dari server). */
export function QrCode({ value, size, accessibilityLabel }: QrCodeProps) {
  const { path, count } = useMemo(() => qrPath(value), [value]);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${count} ${count}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Rect width={count} height={count} fill={colors.surface} />
      <Path d={path} fill={colors.ink} />
    </Svg>
  );
}
