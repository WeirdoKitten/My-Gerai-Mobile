import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { ActiveOrder } from "@/api/schemas/orders";
import { Badge, Card, OrderStatusBadge } from "@/components/ui";
import { formatDateTime, formatSchedule, formatSince } from "@/lib/format/datetime";
import { formatRupiah } from "@/lib/format/money";
import { formatIndonesianPhone } from "@/lib/format/phone";
import { colors, fonts, radius, space, type } from "@/theme";

import { DeliveryInfo } from "./DeliveryInfo";
import { OrderActions } from "./OrderActions";
import { OrderItems } from "./OrderItems";
import { FULFILLMENT_METHOD_LABEL, needsAttention } from "./order-status";
import { Perforation } from "./Perforation";

type ActiveOrderCardProps = {
  order: ActiveOrder;
  /** Layar detail: tampil lengkap dan tidak bisa diketuk. */
  detailed?: boolean;
};

export function ActiveOrderCard({ order, detailed = false }: ActiveOrderCardProps) {
  const attention = needsAttention(order);
  const padLeft = attention ? space.xl : space.lg;

  const summary = (
    <View style={styles.summary}>
      <View style={styles.head}>
        <Text style={type.micro}>{formatSince(order.createdAt)}</Text>
        <View style={styles.badges}>
          {order.scheduledFor ? <Badge label="Pre-order" tone="info" /> : null}
          {order.fulfillmentMethod === "antar" ? <Badge label="Diantar" tone="primary" /> : null}
          <OrderStatusBadge status={order.status} />
        </View>
      </View>
      <Text
        style={type.orderCode}
        accessibilityLabel={`Kode Pesanan ${order.orderCode.split("").join(" ")}`}
      >
        {order.orderCode}
      </Text>
      <Text style={type.bodyStrong}>Atas nama {order.buyerName}</Text>
      {order.eventName ? (
        <Text style={styles.event}>Event {order.eventName}. Diambil Pembeli di Gerai.</Text>
      ) : null}
      {detailed ? (
        <View style={styles.meta}>
          <Text style={type.caption}>Masuk {formatDateTime(order.createdAt)}</Text>
          <Text style={type.caption}>{FULFILLMENT_METHOD_LABEL[order.fulfillmentMethod]}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Card elevated={attention} accent={attention} style={[styles.card, { paddingLeft: padLeft }]}>
      {detailed ? (
        summary
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Buka detail Pesanan"
          onPress={() => router.push(`/pesanan/${order.id}`)}
        >
          {summary}
        </Pressable>
      )}

      {order.scheduledFor ? (
        <View style={styles.schedule}>
          <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.info} />
          <View style={styles.flex}>
            <Text style={styles.scheduleText}>
              {order.fulfillmentMethod === "antar" ? "Antar" : "Diambil"}{" "}
              {formatSchedule(order.scheduledFor)}
            </Text>
            {detailed &&
            !order.delivery &&
            order.buyerPhone &&
            /^\d{8,15}$/.test(order.buyerPhone) ? (
              <Text
                style={styles.phoneLink}
                accessibilityRole="link"
                onPress={() => Linking.openURL(`https://wa.me/${order.buyerPhone}`)}
              >
                WhatsApp {formatIndonesianPhone(order.buyerPhone)}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {order.delivery ? <DeliveryInfo delivery={order.delivery} compact={!detailed} /> : null}

      <Perforation insetLeft={padLeft} insetRight={space.lg} />

      <OrderItems items={order.items} />

      {/* Nilai dari server (totalForMerchant), sama dengan footer Riwayat dan web. */}
      <View style={styles.total}>
        <Text style={type.caption}>
          Bagianmu
          {order.deliveryFeeSnapshot > 0
            ? ` (termasuk Ongkir ${formatRupiah(order.deliveryFeeSnapshot)})`
            : ""}
        </Text>
        <Text style={[type.amount, styles.totalAmount]}>
          {formatRupiah(order.totalForMerchant)}
        </Text>
      </View>

      {detailed && order.buyerNote ? (
        <View style={styles.buyerNote}>
          <Text style={type.label}>Catatan Pembeli</Text>
          <Text style={type.body}>{order.buyerNote}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <OrderActions order={order} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  summary: { gap: space.xs },
  meta: { marginTop: space.xs },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    marginBottom: space.xs,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: space.xs,
    flexShrink: 1,
  },
  event: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.brandStrong },
  schedule: {
    flexDirection: "row",
    gap: space.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radius.control,
    padding: space.md,
  },
  scheduleText: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.info },
  phoneLink: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brandStrong,
  },
  flex: { flex: 1 },
  buyerNote: {
    gap: space.xs,
    backgroundColor: colors.warningBg,
    borderRadius: radius.control,
    padding: space.md,
  },
  total: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  totalAmount: { fontSize: 18, lineHeight: 24 },
  actions: { marginTop: space.xs },
});
