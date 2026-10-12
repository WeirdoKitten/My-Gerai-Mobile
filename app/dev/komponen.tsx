import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, router } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ActiveOrder } from "@/api/schemas/orders";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  OrderStatusBadge,
  PasswordInput,
  ScreenHeader,
  SegmentedControl,
  Sheet,
  Spinner,
  useToast,
} from "@/components/ui";
import { ActiveOrderCard } from "@/features/orders/ActiveOrderCard";
import { colors, layout, space, type } from "@/theme";
import { ORDER_STATUSES } from "@/types/order-status";

// Layar review visual komponen baku. Hanya ada di build development.
export default function ComponentShowcase() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Showcase />;
}

// Contoh tampilan saja; tombol di kartu ini akan gagal karena Pesanan-nya tidak ada di server.
const SAMPLE_ORDER: ActiveOrder = {
  id: "contoh",
  orderCode: "K7QX9MB4",
  status: "dibayar",
  buyerName: "Rina",
  buyerNote: null,
  createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  items: [
    {
      id: "1",
      productNameSnapshot: "Bakso Urat",
      priceSnapshot: 15_000,
      qty: 2,
      note: "Tanpa seledri",
      variantSelections: [
        { groupNameSnapshot: "Kuah", optionNameSnapshot: "Pedas", priceDeltaSnapshot: 0 },
      ],
    },
    {
      id: "2",
      productNameSnapshot: "Es Teh Manis",
      priceSnapshot: 5_000,
      qty: 1,
      note: null,
      variantSelections: [],
    },
  ],
  fulfillmentMethod: "ambil_sendiri",
  deliveryFeeSnapshot: 0,
  delivery: null,
  scheduledFor: null,
  buyerPhone: null,
  eventName: null,
  awaitingManualConfirmation: false,
};

function Showcase() {
  const { showToast } = useToast();
  const [price, setPrice] = useState("");
  const [segment, setSegment] = useState<"aktif" | "riwayat">("aktif");
  const [sheetOpen, setSheetOpen] = useState(false);
  const priceError = price !== "" && !/^\d+$/.test(price) ? "Harga hanya boleh angka." : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Komponen UI" onBack={() => router.back()} />

        <Section title="Kartu Pesanan baru">
          <ActiveOrderCard order={SAMPLE_ORDER} />
        </Section>

        <Section title="Tombol">
          <Button label="Tandai Siap Diambil" size="lg" fullWidth />
          <Button label="Cetak Struk" variant="secondary" fullWidth icon={<PrinterIcon />} />
          <View style={styles.row}>
            <Button label="Batal" variant="ghost" />
            <Button label="Hapus Item" variant="danger" />
          </View>
          <Button label="Keluar" variant="dangerOutline" fullWidth />
          <Button label="Menyimpan" loading fullWidth />
          <Button label="Tidak bisa ditekan" disabled fullWidth />
        </Section>

        <Section title="Isian">
          <Field label="Nama Item">
            <Input placeholder="Mis. Bakso Urat" />
          </Field>
          <Field label="Harga" hint="Dalam Rupiah, tanpa titik." error={priceError}>
            <Input
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder="15000"
              invalid={priceError !== undefined}
            />
          </Field>
          <Field label="Password">
            <PasswordInput />
          </Field>
          <Field label="Deskripsi">
            <Input multiline placeholder="Ceritakan isi atau porsi Item ini" />
          </Field>
        </Section>

        <Section title="Pilihan">
          <SegmentedControl
            segments={[
              { value: "aktif", label: "Aktif" },
              { value: "riwayat", label: "Riwayat" },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Section>

        <Section title="Status Pesanan">
          <View style={styles.wrap}>
            {ORDER_STATUSES.map((status) => (
              <OrderStatusBadge key={status} status={status} />
            ))}
          </View>
          <View style={styles.wrap}>
            <Badge label="Stok 3" tone="warning" />
            <Badge label="Pre-order" tone="info" />
            <Badge label="Diantar" tone="primary" />
            <Badge label="Habis" />
          </View>
        </Section>

        <Section title="Pemberitahuan">
          <Alert tone="success" message="Item tersimpan. QR Menu siap dipakai Pembeli." />
          <Alert
            tone="warning"
            title="Tagihan Biaya Layanan jatuh tempo besok"
            message="Bayar sebelum masa tenggang habis supaya Lapak tetap bisa menerima Pesanan."
          />
          <Alert
            tone="error"
            message="Printer tidak ditemukan. Nyalakan Bluetooth lalu coba lagi."
          />
          <Alert tone="info" message="Tidak ada koneksi. Data yang tampil adalah data terakhir." />
          <Button
            label="Tampilkan toast"
            variant="secondary"
            fullWidth
            onPress={() => showToast("Pesanan K7QX9MB4 ditandai Diproses")}
          />
          <Button
            label="Buka sheet konfirmasi"
            variant="secondary"
            fullWidth
            onPress={() => setSheetOpen(true)}
          />
        </Section>

        <Section title="Kosong dan memuat">
          <EmptyState
            icon="receipt-text-outline"
            title="Belum ada Pesanan masuk"
            description="Pesanan yang sudah dibayar Pembeli muncul di sini."
          />
          <View style={styles.row}>
            <Spinner />
            <Spinner size="large" />
          </View>
        </Section>
      </ScrollView>

      <Sheet
        visible={sheetOpen}
        title="Tandai Pesanan K7QX9MB4 lunas?"
        description="Pastikan uangnya sudah masuk. Status lunas tidak bisa dibatalkan."
        onClose={() => setSheetOpen(false)}
      >
        <Button label="Ya, sudah lunas" size="lg" fullWidth onPress={() => setSheetOpen(false)} />
        <Button label="Batal" variant="ghost" fullWidth onPress={() => setSheetOpen(false)} />
      </Sheet>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={type.heading}>{title}</Text>
      {children}
    </View>
  );
}

function PrinterIcon() {
  return <MaterialCommunityIcons name="printer-outline" size={20} color={colors.ink} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.sm,
    paddingBottom: space.xxxl * 2,
    gap: space.xxxl,
  },
  section: { gap: space.md },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
