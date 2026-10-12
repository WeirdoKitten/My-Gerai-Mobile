import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import type { ReportPeriod, SalesReport } from "@/api/schemas/reports";
import { Alert, Button, Card, ScreenHeader, SegmentedControl, Spinner } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { DailyRevenueChart } from "@/features/reports/DailyRevenueChart";
import { useSalesReport } from "@/features/reports/use-reports";
import { formatRupiah } from "@/lib/format/money";
import { colors, fonts, radius, space, type } from "@/theme";

const PERIODS = [
  { value: "hari_ini", label: "Hari ini" },
  { value: "7_hari", label: "7 hari" },
  { value: "30_hari", label: "30 hari" },
] as const satisfies readonly { value: ReportPeriod; label: string }[];

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const INSIGHT_ICON: Record<string, IconName> = {
  restock: "package-variant",
  item_mati: "sleep",
  jam_ramai: "clock-fast",
  hari_sepi: "calendar-remove-outline",
  fokus_menu: "target",
  sering_bareng: "link-variant",
  harga: "tag-outline",
};

// Angka sama dengan INSIGHT_MIN_* di repo web (src/lib/report/insights.ts), hanya untuk teks.
const INSIGHT_MIN_HISTORY_DAYS = 7;
const INSIGHT_MIN_PAID_ORDERS = 20;

export default function ReportScreen() {
  const [period, setPeriod] = useState<ReportPeriod>("7_hari");
  const report = useSalesReport(period);
  const data = report.data;

  return (
    <Screen header={<ScreenHeader title="Laporan Penjualan" />}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={report.isRefetching && !report.isPlaceholderData}
            onRefresh={() => report.refetch()}
            colors={[colors.brandStrong]}
          />
        }
      >
        <SegmentedControl segments={PERIODS} value={period} onChange={setPeriod} />

        {report.isPending ? (
          <View style={styles.loading}>
            <Spinner size="large" />
          </View>
        ) : report.error && !data ? (
          <View style={styles.section}>
            <Alert tone="error" message={errorMessage(report.error)} />
            <Button label="Coba lagi" variant="secondary" onPress={() => report.refetch()} />
          </View>
        ) : data ? (
          <View style={[styles.body, report.isPlaceholderData && styles.stale]}>
            <Summary report={data} />
            <Assistant report={data} />
            {data.daily.length > 1 ? (
              <View style={styles.section}>
                <Text style={type.heading}>Omzet per hari</Text>
                <Card>
                  <DailyRevenueChart key={data.period} daily={data.daily} />
                </Card>
              </View>
            ) : null}
            <TopItems items={data.topItems} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Summary({ report }: { report: SalesReport }) {
  const { summary, delta } = report;
  return (
    <View style={styles.section}>
      <View style={styles.hero}>
        <Text style={type.caption}>Omzet</Text>
        <Text style={styles.heroValue} adjustsFontSizeToFit numberOfLines={1}>
          {formatRupiah(summary.revenue)}
        </Text>
        <Delta pct={delta.revenuePct} />
      </View>
      <View style={styles.grid}>
        <Stat
          label="Keuntungan"
          value={formatRupiah(summary.profit)}
          pct={delta.profitPct}
          note={summary.profitIncomplete ? "Sebagian Item belum ada Harga Modal" : undefined}
        />
        <Stat label="Pesanan" value={String(summary.orderCount)} pct={delta.orderCountPct} />
        <Stat label="Rata-rata per Pesanan" value={formatRupiah(summary.avgOrderValue)} />
        <Stat
          label="Ongkir"
          value={formatRupiah(summary.deliveryFeeTotal)}
          note="Dari pesanan antar, masuk penuh ke kamu"
        />
      </View>
      <View style={styles.billed}>
        <View style={styles.flex}>
          <Text style={type.label}>Ditagih ke Pembeli</Text>
          <Text style={type.micro}>
            Termasuk Biaya Layanan {formatRupiah(summary.platformFeeTotal)}
            {summary.deliveryFeeTotal > 0
              ? ` dan Ongkir ${formatRupiah(summary.deliveryFeeTotal)}`
              : ""}
          </Text>
        </View>
        <Text style={[type.amount, styles.billedValue]}>{formatRupiah(summary.buyerTotal)}</Text>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  pct,
  note,
}: {
  label: string;
  value: string;
  pct?: number | null;
  note?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={type.micro}>{label}</Text>
      <Text style={styles.statValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
      {pct !== undefined ? <Delta pct={pct} /> : null}
      {note ? <Text style={type.micro}>{note}</Text> : null}
    </View>
  );
}

/** Perubahan vs periode sebelumnya, persen dari server. Naik hijau, turun merah, selalu dengan panah. */
function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <Text style={type.micro}>Periode lalu belum ada data</Text>;
  if (pct === 0) return <Text style={type.micro}>Sama seperti periode lalu</Text>;
  const up = pct > 0;
  const color = up ? colors.success : colors.danger;
  return (
    <View style={styles.delta}>
      <MaterialCommunityIcons name={up ? "arrow-up" : "arrow-down"} size={14} color={color} />
      <Text style={[styles.deltaText, { color }]}>{Math.abs(pct)}% vs periode lalu</Text>
    </View>
  );
}

function Assistant({ report }: { report: SalesReport }) {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.brand} />
        <Text style={type.heading}>Rekomendasi Asisten</Text>
      </View>
      {report.insightsPending ? (
        <Card>
          <Text style={type.caption}>
            Asisten butuh setidaknya {INSIGHT_MIN_HISTORY_DAYS} hari data dan{" "}
            {INSIGHT_MIN_PAID_ORDERS} Pesanan dibayar untuk memberi rekomendasi yang bisa dipercaya.
            Terus layani Pesanan lewat MyGerai, nanti rekomendasi muncul di sini.
          </Text>
        </Card>
      ) : report.insights.length === 0 ? (
        <Card>
          <Text style={type.caption}>
            Belum ada rekomendasi baru, pola penjualanmu terlihat sehat. Cek lagi beberapa hari ke
            depan.
          </Text>
        </Card>
      ) : (
        report.insights.map((insight) => (
          <Card key={insight.kind} style={styles.insight}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name={INSIGHT_ICON[insight.kind] ?? "lightbulb-outline"}
                size={20}
                color={colors.brandStrong}
              />
            </View>
            <View style={styles.flex}>
              <Text style={type.bodyStrong}>{insight.title}</Text>
              <Text style={type.caption}>{insight.body}</Text>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

function TopItems({ items }: { items: SalesReport["topItems"] }) {
  return (
    <View style={styles.section}>
      <Text style={type.heading}>Item terlaris</Text>
      {items.length === 0 ? (
        <Card>
          <Text style={type.caption}>Belum ada Item terjual di periode ini.</Text>
        </Card>
      ) : (
        <Card style={styles.topList}>
          {items.map((item, index) => {
            const share = Math.round(item.revenueShare * 100);
            return (
              <View
                key={item.productId}
                style={[styles.topRow, index > 0 && styles.topBorder]}
                accessible
                accessibilityLabel={`${item.name}, ${item.qtySold} terjual, ${formatRupiah(
                  item.revenue,
                )}, ${share} persen omzet`}
              >
                <View style={styles.topHead}>
                  <Text style={[type.label, styles.flex]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[type.amount, styles.topValue]}>{formatRupiah(item.revenue)}</Text>
                </View>
                <View style={styles.topHead}>
                  <View style={styles.track}>
                    <View
                      style={[styles.fill, { width: `${Math.max(2, item.revenueShare * 100)}%` }]}
                    />
                  </View>
                  <Text style={[type.micro, styles.topMeta]}>
                    {item.qtySold} terjual, {share}%
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  loading: { paddingVertical: space.xxxl * 2, alignItems: "center" },
  body: { gap: space.xxl },
  stale: { opacity: 0.55 },
  section: { gap: space.md },
  hero: { gap: 2 },
  heroValue: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 48,
    color: colors.ink,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  stat: {
    flexBasis: "48%",
    flexGrow: 1,
    gap: 2,
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  statValue: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.ink },
  billed: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderRadius: radius.card,
    backgroundColor: colors.neutralBg,
  },
  billedValue: { fontSize: 16 },
  delta: { flexDirection: "row", alignItems: "center", gap: 2 },
  deltaText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  insight: { flexDirection: "row", gap: space.md },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  topList: { paddingVertical: space.xs },
  topRow: { gap: space.xs, paddingVertical: space.md },
  topBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  topHead: { flexDirection: "row", alignItems: "center", gap: space.md },
  topValue: { fontSize: 14 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralBg,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.brand },
  topMeta: { minWidth: 84, textAlign: "right" },
});
