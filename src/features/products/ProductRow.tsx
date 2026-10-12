import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "@/api/schemas/products";
import { Badge, PhotoThumb, Toggle } from "@/components/ui";
import { formatRupiah } from "@/lib/format/money";
import { colors, fonts, space, type } from "@/theme";

type ProductRowProps = {
  product: Product;
  onToggle: (available: boolean) => void;
  toggling: boolean;
};

export function ProductRow({ product, onToggle, toggling }: ProductRowProps) {
  const available = product.status === "available";
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Ubah Item"
        onPress={() => router.push(`/item/${product.id}`)}
        android_ripple={{ color: colors.line }}
        style={styles.main}
      >
        <PhotoThumb src={product.photoUrl} size={64} dimmed={!available} />
        <View style={styles.text}>
          <Text style={[type.bodyStrong, !available && styles.muted]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>{formatRupiah(product.price)}</Text>
          <View style={styles.badges}>
            {product.preOrder ? <Badge label="Pre-order" tone="info" /> : null}
            {!available ? <Badge label="Habis" tone="neutral" /> : null}
            {available && product.stock !== null ? (
              <Badge
                label={`Stok ${product.stock}`}
                tone={product.stock === 0 ? "danger" : "warning"}
              />
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.toggle}>
        <Toggle
          value={available}
          onValueChange={onToggle}
          disabled={toggling}
          label={`${product.name} tersedia`}
        />
        <Text style={[styles.toggleLabel, available && styles.toggleOn]}>
          {available ? "Tersedia" : "Habis"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingLeft: space.lg,
    paddingRight: space.sm,
  },
  text: { flex: 1, gap: 2 },
  muted: { color: colors.inkMuted },
  price: { ...type.amount, fontSize: 15, lineHeight: 22, color: colors.ink },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: space.xs, marginTop: space.xs },
  toggle: { alignItems: "center", paddingRight: space.md, width: 76 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.inkMuted },
  toggleOn: { color: colors.success },
});
