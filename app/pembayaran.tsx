import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import type { PaymentSettings } from "@/api/schemas/payments";
import { Alert, Button, Card, EmptyState, PhotoThumb, Spinner, SubScreen } from "@/components/ui";
import { InvoiceCard } from "@/features/payments/InvoiceCard";
import {
  usePaymentSettings,
  useServiceFeeInvoices,
  useUploadQrisPhoto,
} from "@/features/payments/use-payments";
import { pickPhoto } from "@/lib/media/photo";
import { colors, layout, space, type } from "@/theme";

const MODE_LABEL: Record<PaymentSettings["paymentMode"], { title: string; body: string }> = {
  gateway: {
    title: "Payment Gateway (Midtrans)",
    body: "Pembeli membayar lewat MyGerai, lalu uangnya dicairkan Admin ke rekening Pencairan kamu.",
  },
  qris_pribadi: {
    title: "QRIS Pribadi",
    body: "Pembeli membayar langsung ke QRIS kamu. Biaya Layanan ditagih mingguan di bawah.",
  },
};

export default function PaymentScreen() {
  const settings = usePaymentSettings();
  const invoices = useServiceFeeInvoices();

  // Spinner tarik-segarkan hanya untuk tarikan manual, bukan polling tagihan.
  const [refreshing, setRefreshing] = useState(false);
  async function refresh() {
    setRefreshing(true);
    await Promise.all([settings.refetch(), invoices.refetch()]);
    setRefreshing(false);
  }

  return (
    <SubScreen title="Metode Pembayaran">
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.brandStrong]}
          />
        }
      >
        {settings.isPending ? (
          <Spinner size="large" />
        ) : settings.error ? (
          <Alert tone="error" message={errorMessage(settings.error)} />
        ) : (
          <>
            {settings.data.storefrontLocked ? (
              <Alert
                tone="error"
                title="Lapak tidak menerima Pesanan baru"
                message="Ada tagihan Biaya Layanan yang menunggak. Bayar tagihan di bawah untuk membuka kembali."
              />
            ) : null}
            <ModeCard settings={settings.data} />
          </>
        )}

        <View style={styles.section}>
          <Text style={type.heading}>Tagihan Biaya Layanan</Text>
          {invoices.isPending ? (
            <Spinner />
          ) : invoices.error && !invoices.data ? (
            <View style={styles.section}>
              <Alert tone="error" message={errorMessage(invoices.error)} />
              <Button label="Coba lagi" variant="secondary" onPress={() => invoices.refetch()} />
            </View>
          ) : invoices.data && invoices.data.invoices.length > 0 ? (
            invoices.data.invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <EmptyState
              icon="receipt-text-outline"
              title="Belum ada tagihan"
              description="Tagihan Biaya Layanan mingguan muncul di sini kalau Lapak memakai QRIS Pribadi."
            />
          )}
        </View>
      </ScrollView>
    </SubScreen>
  );
}

function ModeCard({ settings }: { settings: PaymentSettings }) {
  const upload = useUploadQrisPhoto();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const mode = MODE_LABEL[settings.paymentMode];

  async function choose() {
    setPhotoError(null);
    try {
      // QRIS tidak dipotong supaya kodenya utuh.
      const result = await pickPhoto("gallery", null);
      if (result.kind === "denied") setPhotoError(result.message);
      if (result.kind === "picked") upload.mutate(result.uri);
    } catch {
      setPhotoError("Gagal memproses foto. Coba foto lain.");
    }
  }

  return (
    <Card style={styles.mode}>
      <View style={styles.modeHead}>
        <MaterialCommunityIcons name="wallet-outline" size={24} color={colors.brandStrong} />
        <View style={styles.flex}>
          <Text style={type.micro}>Metode saat ini</Text>
          <Text style={type.bodyStrong}>{mode.title}</Text>
        </View>
      </View>
      <Text style={type.caption}>{mode.body}</Text>
      <Text style={type.micro}>
        Hanya Admin yang bisa mengubah metode pembayaran. Kalau ingin beralih ke QRIS Pribadi,
        unggah foto QRIS di bawah lalu hubungi Admin.
      </Text>
      <View style={styles.divider} />
      <Text style={type.label}>Foto QRIS Pribadi</Text>
      <View style={styles.qris}>
        <PhotoThumb src={settings.qrisPhotoUrl} size={88} />
        <View style={styles.flex}>
          <Button
            label={settings.qrisPhotoUrl ? "Ganti foto QRIS" : "Unggah foto QRIS"}
            variant="secondary"
            fullWidth
            loading={upload.isPending}
            icon={<MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.ink} />}
            onPress={choose}
          />
        </View>
      </View>
      {photoError || upload.error ? (
        <Alert tone="error" message={photoError ?? errorMessage(upload.error)} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  section: { gap: space.md },
  mode: { gap: space.md },
  modeHead: { flexDirection: "row", alignItems: "center", gap: space.md },
  divider: { height: 1, backgroundColor: colors.line },
  qris: { flexDirection: "row", alignItems: "center", gap: space.lg },
});
