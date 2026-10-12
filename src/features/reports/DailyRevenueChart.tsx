import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import type { DailySales } from "@/api/schemas/reports";
import { formatDayKey } from "@/lib/format/datetime";
import { formatRupiah, formatRupiahCompact } from "@/lib/format/money";
import { colors, fonts, space, type } from "@/theme";

const PLOT_HEIGHT = 148;
const AXIS_WIDTH = 40;
const X_LABEL_HEIGHT = 22;
const MAX_BAR = 24;
const BAR_RADIUS = 4;
const TICKS = 3;

/** Batas atas sumbu dibulatkan ke angka "bersih" (1, 2, 2,5, 5 x 10^n). */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= value) ?? 10;
  return step * magnitude;
}

/** Kolom dengan ujung atas membulat 4px dan dasar persegi di garis nol. */
function columnPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(BAR_RADIUS, width / 2, height);
  const bottom = y + height;
  return [
    `M${x},${bottom}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${bottom}`,
    "Z",
  ].join(" ");
}

/**
 * Omzet per hari (satu seri, warna brand). Ketuk kolom untuk melihat angkanya; kolom
 * terpilih memakai brandStrong. Bentuk mengikuti skill dataviz: kolom tipis maks 24px,
 * satu sumbu, grid garis rambut, label tanggal hanya di awal, tengah, dan akhir.
 */
export function DailyRevenueChart({ daily }: { daily: DailySales[] }) {
  const [width, setWidth] = useState(0);
  // Awalnya hari terakhir yang ada omzetnya, supaya angka di atas grafik tidak kosong.
  const [selected, setSelected] = useState(() => {
    const lastWithSales = daily.findLastIndex((d) => d.revenue > 0);
    return lastWithSales >= 0 ? lastWithSales : daily.length - 1;
  });
  const active = daily[Math.min(selected, daily.length - 1)];

  const max = niceMax(Math.max(...daily.map((d) => d.revenue)));
  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const slot = daily.length > 0 ? plotWidth / daily.length : 0;
  // Celah antar kolom minimal 2px (spacer permukaan).
  const barWidth = Math.max(2, Math.min(MAX_BAR, slot * 0.62, slot - 2));
  const labelIndexes = new Set([0, Math.floor((daily.length - 1) / 2), daily.length - 1]);
  const peak = daily.reduce(
    (best, d, i) => (d.revenue > (daily[best]?.revenue ?? 0) ? i : best),
    0,
  );

  return (
    <View style={styles.root}>
      {active ? (
        <View style={styles.readout} accessibilityLiveRegion="polite">
          <Text style={type.micro}>{formatDayKey(active.date)}</Text>
          <Text style={styles.readoutValue}>{formatRupiah(active.revenue)}</Text>
          <Text style={type.micro}>{active.orderCount} Pesanan</Text>
        </View>
      ) : null}

      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`Grafik omzet per hari. Tertinggi ${formatRupiah(
          daily[peak]?.revenue ?? 0,
        )} pada ${daily[peak] ? formatDayKey(daily[peak].date) : "-"}.`}
      >
        {width > 0 ? (
          <Svg width={width} height={PLOT_HEIGHT + X_LABEL_HEIGHT}>
            {/* Sorotan kolom terpilih, di belakang grid dan kolom. */}
            <Rect
              x={AXIS_WIDTH + slot * selected + 1}
              y={0}
              width={Math.max(0, slot - 2)}
              height={PLOT_HEIGHT}
              rx={4}
              fill={colors.neutralBg}
            />
            {Array.from({ length: TICKS }, (_, i) => {
              const value = (max / (TICKS - 1)) * i;
              const y = PLOT_HEIGHT - (value / max) * PLOT_HEIGHT + 0.5;
              return (
                <G key={value}>
                  <Line
                    x1={AXIS_WIDTH}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke={colors.line}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={AXIS_WIDTH - 6}
                    y={i === TICKS - 1 ? y + 10 : y - 3}
                    fontSize={11}
                    fontFamily={fonts.medium}
                    fill={colors.inkMuted}
                    textAnchor="end"
                  >
                    {formatRupiahCompact(value)}
                  </SvgText>
                </G>
              );
            })}

            {daily.map((day, i) => {
              const h = day.revenue > 0 ? Math.max(2, (day.revenue / max) * PLOT_HEIGHT) : 0;
              const x = AXIS_WIDTH + slot * i + (slot - barWidth) / 2;
              return (
                <G key={day.date}>
                  {h > 0 ? (
                    <Path
                      d={columnPath(x, PLOT_HEIGHT - h, barWidth, h)}
                      fill={i === selected ? colors.brandStrong : colors.brand}
                    />
                  ) : null}
                  {labelIndexes.has(i) ? (
                    <SvgText
                      x={AXIS_WIDTH + slot * i + slot / 2}
                      y={PLOT_HEIGHT + 16}
                      fontSize={11}
                      fontFamily={fonts.medium}
                      fill={colors.inkMuted}
                      textAnchor={
                        i === 0 && daily.length > 2
                          ? "start"
                          : i === daily.length - 1 && daily.length > 2
                            ? "end"
                            : "middle"
                      }
                      dx={
                        i === 0 && daily.length > 2
                          ? -slot / 2 + 2
                          : i === daily.length - 1 && daily.length > 2
                            ? slot / 2 - 2
                            : 0
                      }
                    >
                      {formatDayKey(day.date)}
                    </SvgText>
                  ) : null}
                  {/* Area ketuk selebar slot dan setinggi plot, lebih besar dari kolomnya. */}
                  <Rect
                    x={AXIS_WIDTH + slot * i}
                    y={0}
                    width={slot}
                    height={PLOT_HEIGHT + X_LABEL_HEIGHT}
                    fill="transparent"
                    onPress={() => setSelected(i)}
                  />
                </G>
              );
            })}
          </Svg>
        ) : (
          <View style={{ height: PLOT_HEIGHT + X_LABEL_HEIGHT }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  readout: { gap: 2 },
  readoutValue: { ...type.amount, fontSize: 20, lineHeight: 26 },
});
