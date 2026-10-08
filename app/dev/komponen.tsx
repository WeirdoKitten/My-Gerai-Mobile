import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  OrderStatusBadge,
  Spinner,
} from "@/components/ui";
import { formatRupiah } from "@/lib/format/money";
import { colors, layout, space, type } from "@/theme";
import { ORDER_STATUSES } from "@/types/order-status";

// Layar review visual komponen baku. Hanya ada di build development.
export default function ComponentShowcase() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Showcase />;
}

const SAMPLE_ITEMS = [
  { qty: 2, name: "Bakso urat", note: "Tanpa seledri", price: 30_000 },
  { qty: 1, name: "Es teh manis", note: null, price: 5_000 },
];

function Showcase() {
  const [price, setPrice] = useState("");
  const priceError = price !== "" && !/^\d+$/.test(price) ? "Harga hanya boleh angka." : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.title}>Komponen UI</Text>

        <Section title="Kartu Pesanan baru">
          <OrderTicket />
        </Section>

        <Section title="Tombol">
          <Button label="Tandai Siap Diambil" size="lg" fullWidth />
          <Button label="Cetak Struk" variant="secondary" fullWidth icon={<PrinterIcon />} />
          <View style={styles.row}>
            <Button label="Batal" variant="ghost" />
            <Button label="Hapus Item" variant="danger" />
          </View>
          <Button label="Menyimpan" loading fullWidth />
          <Button label="Tidak bisa ditekan" disabled fullWidth />
        </Section>

        <Section title="Isian">
          <Field label="Nama Item">
            <Input placeholder="Mis. Bakso urat" />
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
          <Field label="Deskripsi">
            <Input multiline placeholder="Ceritakan isi atau porsi Item ini" />
          </Field>
        </Section>

        <Section title="Status Pesanan">
          <View style={styles.wrap}>
            {ORDER_STATUSES.map((status) => (
              <OrderStatusBadge key={status} status={status} />
            ))}
          </View>
          <View style={styles.wrap}>
            <Badge label="Stok 3" tone="warning" />
            <Badge label="Pre-order" tone="primary" />
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
        </Section>

        <Section title="Memuat">
          <View style={styles.row}>
            <Spinner />
            <Spinner size="large" />
          </View>
        </Section>
      </ScrollView>
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

function OrderTicket() {
  const total = SAMPLE_ITEMS.reduce((sum, item) => sum + item.price, 0);
  return (
    <Card elevated accent style={styles.ticket}>
      <View style={styles.ticketHead}>
        <Text style={type.micro}>Masuk 2 menit lalu</Text>
        <OrderStatusBadge status="dibayar" />
      </View>
      <Text style={type.orderCode} accessibilityLabel="Kode Pesanan K 7 Q X 9 M B 4">
        K7QX9MB4
      </Text>
      <Text style={type.bodyStrong}>Atas nama Rina</Text>

      <Perforation />

      <View style={styles.items}>
        {SAMPLE_ITEMS.map((item) => (
          <View key={item.name} style={styles.itemRow}>
            <Text style={[type.amount, styles.qty]}>{item.qty}×</Text>
            <View style={styles.itemBody}>
              <Text style={type.body}>{item.name}</Text>
              {item.note ? <Text style={type.caption}>{item.note}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={type.caption}>Total</Text>
        <Text style={[type.amount, styles.total]}>{formatRupiah(total)}</Text>
      </View>

      <Button label="Tandai Diproses" size="lg" fullWidth />
    </Card>
  );
}

// Sobekan tiket: garis putus-putus dengan coakan setengah lingkaran di kedua sisi kartu.
function Perforation() {
  return (
    <View style={styles.perforation}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={styles.dashClip}>
        <View style={styles.dash} />
      </View>
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const NOTCH = 20;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.xl,
    paddingBottom: space.xxxl * 2,
    gap: space.xxxl,
  },
  section: { gap: space.md },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  ticket: { gap: space.xs, paddingLeft: space.xl },
  ticketHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xs,
  },
  perforation: {
    height: NOTCH,
    marginVertical: space.sm,
    marginLeft: -space.xl,
    marginRight: -space.lg,
    justifyContent: "center",
  },
  notch: {
    position: "absolute",
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.bg,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashClip: { height: 1, overflow: "hidden", marginHorizontal: NOTCH },
  dash: { height: 2, borderWidth: 1, borderColor: colors.line, borderStyle: "dashed" },
  items: { gap: space.sm },
  itemRow: { flexDirection: "row", gap: space.md },
  qty: { fontSize: 16, lineHeight: 24, minWidth: 28, color: colors.brandStrong },
  itemBody: { flex: 1 },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: space.md,
    marginBottom: space.md,
  },
  total: { fontSize: 22, lineHeight: 28 },
});
