import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, EmptyState, Spinner, SubScreen } from "@/components/ui";
import { usePayoutSummary } from "@/features/payments/use-payments";
import { formatDateTime } from "@/lib/format/datetime";
import { formatRupiah } from "@/lib/format/money";
import { colors, fonts, layout, radius, space, type } from "@/theme";

export default function BalanceScreen() {
  const summary = usePayoutSummary();
  const data = summary.data;

  return (
    <SubScreen title="Saldo & Pencairan">
      {summary.isPending ? (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      ) : summary.error && !data ? (
        <View style={styles.pad}>
          <Alert tone="error" message={errorMessage(summary.error)} />
          <Button label="Coba lagi" variant="secondary" onPress={() => summary.refetch()} />
        </View>
      ) : data ? (
        <FlatList
          data={data.payouts}
          keyExtractor={(payout) => payout.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.hero}>
                <Text style={type.caption}>Saldo belum dicairkan</Text>
                <Text style={styles.balance} adjustsFontSizeToFit numberOfLines={1}>
                  {formatRupiah(data.balance)}
                </Text>
                <Text style={type.micro}>
                  Dari Pesanan lunas yang dibayar lewat MyGerai. Pesanan QRIS Pribadi tidak dihitung
                  karena uangnya sudah langsung masuk ke kamu. Admin mengirim Saldo ke rekening
                  Pencairan di Ubah Profil.
                </Text>
              </View>
              <Text style={type.heading}>Riwayat Pencairan</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="wallet-outline"
              title="Belum ada Pencairan"
              description="Setiap kali Admin mencairkan Saldo ke rekening kamu, catatannya muncul di sini."
            />
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.row,
                index === 0 && styles.rowFirst,
                index === data.payouts.length - 1 && styles.rowLast,
              ]}
            >
              <View style={styles.flex}>
                <Text style={type.body}>{formatDateTime(item.settledAt)}</Text>
                {item.note ? <Text style={type.caption}>{item.note}</Text> : null}
              </View>
              <Text style={[type.amount, styles.amount]}>{formatRupiah(item.amount)}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={summary.isRefetching}
              onRefresh={() => summary.refetch()}
              colors={[colors.brandStrong]}
            />
          }
        />
      ) : null}
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { padding: layout.screenPaddingX, gap: space.md },
  list: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
  },
  header: { gap: space.xl, marginBottom: space.md },
  hero: {
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  balance: { fontFamily: fonts.bold, fontSize: 36, lineHeight: 44, color: colors.ink },
  // Satu panel berborder berisi baris, seperti daftar Item.
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
  },
  rowFirst: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  amount: { fontSize: 16, lineHeight: 24 },
});
