import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { HistoryOrder } from "@/api/schemas/orders";
import { Badge, Card, OrderStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format/datetime";
import { formatRupiah } from "@/lib/format/money";
import { colors, space, type } from "@/theme";

import { DeliveryInfo } from "./DeliveryInfo";
import { OrderItems } from "./OrderItems";

type HistoryOrderCardProps = { order: HistoryOrder; detailed?: boolean };

// Read-only. Nominal di footer langsung dari server, sama dengan web.
export function HistoryOrderCard({ order, detailed = false }: HistoryOrderCardProps) {
  const done = order.status === "selesai";

  const body = (
    <View style={styles.body}>
      <View style={styles.head}>
        <Text style={[type.heading, styles.code]}>{order.orderCode}</Text>
        <View style={styles.badges}>
          {order.fulfillmentMethod === "antar" ? <Badge label="Diantar" tone="primary" /> : null}
          <OrderStatusBadge status={order.status} />
        </View>
      </View>
      <View>
        <Text style={type.body}>Atas nama {order.buyerName}</Text>
        <Text style={type.caption}>{formatDateTime(order.createdAt)}</Text>
      </View>
      {order.eventName ? <Text style={type.caption}>Event {order.eventName}</Text> : null}
      {detailed && order.delivery ? <DeliveryInfo delivery={order.delivery} /> : null}
      <View style={styles.divider} />
      <OrderItems items={order.items} />
      <View style={styles.footer}>
        <Text style={type.caption}>{done ? "Bagianmu" : "Nilai Pesanan"}</Text>
        <Text style={[type.amount, styles.amount]}>
          {formatRupiah(done ? order.totalForMerchant : order.subtotal)}
        </Text>
      </View>
    </View>
  );

  return (
    <Card style={styles.card}>
      {detailed ? (
        body
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Buka detail Pesanan"
          onPress={() => router.push(`/pesanan/${order.id}`)}
        >
          {body}
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.lg },
  body: { gap: space.md },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  code: { letterSpacing: 1.5, fontVariant: ["tabular-nums"] },
  badges: { flexDirection: "row", gap: space.xs },
  divider: { height: 1, backgroundColor: colors.line },
  footer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  amount: { fontSize: 18, lineHeight: 24 },
});
