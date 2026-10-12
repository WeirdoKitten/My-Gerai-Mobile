import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ServiceFeeInvoice } from "@/api/schemas/payments";
import { Alert, Badge, type BadgeTone, Button, Card, useToast } from "@/components/ui";
import { formatDateTime } from "@/lib/format/datetime";
import { formatRupiah } from "@/lib/format/money";
import { imageToFile, saveToGallery, shareImage } from "@/lib/media/save-image";
import { colors, fonts, radius, space, type } from "@/theme";

const STATUS: Record<ServiceFeeInvoice["status"], { label: string; tone: BadgeTone }> = {
  belum_lunas: { label: "Belum Lunas", tone: "warning" },
  lunas: { label: "Lunas", tone: "success" },
  dibatalkan: { label: "Dibatalkan", tone: "neutral" },
};

const QR_SIZE = 220;

/** Satu tagihan Biaya Layanan. Yang belum lunas menampilkan QR bayar + simpan/bagikan. */
export function InvoiceCard({ invoice }: { invoice: ServiceFeeInvoice }) {
  const unpaid = invoice.status === "belum_lunas";
  const status = STATUS[invoice.status];

  return (
    <Card elevated={unpaid} accent={unpaid} style={styles.root}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={type.micro}>Periode</Text>
          <Text style={type.caption}>
            {formatDateTime(invoice.periodStart)} sampai {formatDateTime(invoice.periodEnd)}
          </Text>
        </View>
        <Badge label={status.label} tone={status.tone} dot />
      </View>
      <Text style={[styles.amount, !unpaid && styles.amountQuiet]}>
        {formatRupiah(invoice.amount)}
      </Text>
      {unpaid ? (
        <Text style={styles.due}>Jatuh tempo {formatDateTime(invoice.dueAt)}</Text>
      ) : invoice.paidAt ? (
        <Text style={type.micro}>Dibayar {formatDateTime(invoice.paidAt)}</Text>
      ) : null}
      {unpaid && invoice.qrImageUrl ? (
        <PayQr invoiceId={invoice.id} src={invoice.qrImageUrl} />
      ) : null}
      {unpaid && !invoice.qrImageUrl ? (
        <Text style={type.caption}>QR pembayaran sedang disiapkan. Cek lagi sebentar.</Text>
      ) : null}
    </Card>
  );
}

function PayQr({ invoiceId, src }: { invoiceId: string; src: string }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState<"save" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "save" | "share") {
    setError(null);
    setBusy(kind);
    try {
      const file = await imageToFile(src, `tagihan-${invoiceId.slice(0, 8)}.png`);
      const result =
        kind === "save" ? await saveToGallery(file) : await shareImage(file, "Bagikan QR tagihan");
      if (!result.ok) setError(result.message);
      else if (kind === "save") showToast("QR tagihan disimpan ke galeri");
    } catch {
      setError("Gambar QR gagal disimpan. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={styles.pay}>
      <View style={styles.qrFrame}>
        <Image
          source={{ uri: src }}
          style={styles.qr}
          contentFit="contain"
          accessibilityLabel="QR pembayaran tagihan"
        />
      </View>
      <View style={styles.steps}>
        {[
          "Simpan QR ini ke galeri.",
          "Buka aplikasi e-wallet atau m-banking, pilih bayar QRIS, lalu ambil QR dari galeri.",
          "Status di sini berubah sendiri setelah pembayaran diterima.",
        ].map((step, index) => (
          <View key={step} style={styles.step}>
            <Text style={styles.stepNo}>{index + 1}</Text>
            <Text style={[type.caption, styles.flex]}>{step}</Text>
          </View>
        ))}
      </View>
      {error ? <Alert tone="error" message={error} /> : null}
      <Button
        label="Simpan QR ke galeri"
        fullWidth
        loading={busy === "save"}
        disabled={busy !== null}
        icon={<MaterialCommunityIcons name="download" size={20} color={colors.onBrand} />}
        onPress={() => run("save")}
      />
      <Button
        label="Bagikan QR"
        variant="ghost"
        fullWidth
        loading={busy === "share"}
        disabled={busy !== null}
        onPress={() => run("share")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { gap: space.sm },
  head: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  amountQuiet: { fontSize: 20, lineHeight: 26 },
  due: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.warning },
  pay: {
    gap: space.md,
    marginTop: space.sm,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  qrFrame: {
    alignSelf: "center",
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  qr: { width: QR_SIZE, height: QR_SIZE },
  steps: { gap: space.sm },
  step: { flexDirection: "row", gap: space.sm },
  stepNo: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    color: colors.brandStrong,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 22,
    textAlign: "center",
  },
});
