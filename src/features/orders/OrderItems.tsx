import { StyleSheet, Text, View } from "react-native";

import type { OrderItem } from "@/api/schemas/orders";
import { formatRupiah } from "@/lib/format/money";
import { colors, fonts, space, type } from "@/theme";

// Harga baris = harga snapshot server × qty, sama dengan dashboard web. Tidak ada total di sini.
export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.qty}>{item.qty}×</Text>
          <View style={styles.body}>
            <Text style={type.body}>{item.productNameSnapshot}</Text>
            {item.variantSelections.length > 0 ? (
              <Text style={type.caption}>
                {item.variantSelections
                  .map((s) => `${s.groupNameSnapshot}: ${s.optionNameSnapshot}`)
                  .join(", ")}
              </Text>
            ) : null}
            {item.note ? <Text style={styles.note}>“{item.note}”</Text> : null}
          </View>
          <Text style={styles.price}>{formatRupiah(item.priceSnapshot * item.qty)}</Text>
        </View>
      ))}
    </View>
  );
}

const QTY_WIDTH = 32;

const styles = StyleSheet.create({
  list: { gap: space.md },
  row: { flexDirection: "row", gap: space.sm },
  qty: {
    ...type.amount,
    fontSize: 16,
    lineHeight: 24,
    minWidth: QTY_WIDTH,
    color: colors.brandStrong,
  },
  body: { flex: 1, gap: 2 },
  note: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.warning },
  price: { ...type.amount, fontSize: 15, lineHeight: 24, color: colors.inkMuted },
});
