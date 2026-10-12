import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Linking, StyleSheet, Text, View } from "react-native";

import type { OrderDelivery } from "@/api/schemas/orders";
import { Button } from "@/components/ui";
import { formatIndonesianPhone } from "@/lib/format/phone";
import { colors, radius, space, type } from "@/theme";

import { DELIVERY_FAILURE_REASON_LABEL } from "./order-status";

type DeliveryInfoProps = {
  delivery: OrderDelivery;
  /** Ringkas untuk kartu antrean: alamat saja, tanpa tombol hubungi. */
  compact?: boolean;
};

export function DeliveryInfo({ delivery, compact = false }: DeliveryInfoProps) {
  const distance =
    delivery.distanceKm !== null ? `${delivery.distanceKm.toFixed(1).replace(".", ",")} km` : null;

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.brandStrong} />
        <View style={styles.body}>
          <Text style={type.body} numberOfLines={compact ? 2 : undefined}>
            {delivery.address}
          </Text>
          {delivery.landmark ? (
            <Text style={type.caption} numberOfLines={compact ? 1 : undefined}>
              Patokan: {delivery.landmark}
            </Text>
          ) : null}
          {distance ? <Text style={type.micro}>{distance} dari Lapak</Text> : null}
        </View>
      </View>

      {delivery.failureReason ? (
        <Text style={styles.failure}>
          Gagal diantar: {DELIVERY_FAILURE_REASON_LABEL[delivery.failureReason]}
          {delivery.failureNote ? `. ${delivery.failureNote}` : ""}
        </Text>
      ) : null}

      {compact || !isDigits(delivery.buyerPhone) ? null : (
        <View style={styles.contact}>
          <Text style={type.bodyStrong}>{formatIndonesianPhone(delivery.buyerPhone)}</Text>
          <View style={styles.contactButtons}>
            <View style={styles.flex}>
              <Button
                label="WhatsApp"
                variant="secondary"
                fullWidth
                icon={<MaterialCommunityIcons name="whatsapp" size={20} color={colors.success} />}
                onPress={() => Linking.openURL(`https://wa.me/${delivery.buyerPhone}`)}
              />
            </View>
            <View style={styles.flex}>
              <Button
                label="Telepon"
                variant="secondary"
                fullWidth
                icon={<MaterialCommunityIcons name="phone-outline" size={20} color={colors.ink} />}
                onPress={() => Linking.openURL(`tel:+${delivery.buyerPhone}`)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.md,
    backgroundColor: colors.brandTint,
    borderRadius: radius.control,
    padding: space.md,
  },
  row: { flexDirection: "row", gap: space.sm },
  body: { flex: 1, gap: 2 },
  failure: { ...type.caption, color: colors.danger },
  contact: { gap: space.sm },
  contactButtons: { flexDirection: "row", gap: space.sm },
  flex: { flex: 1 },
});

// Nomor dari server (format 62...). Hanya angka yang dipakai untuk membangun link wa.me/tel.
function isDigits(value: string): boolean {
  return /^\d{8,15}$/.test(value);
}
