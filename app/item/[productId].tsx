import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, EmptyState, Spinner } from "@/components/ui";
import { ProductForm } from "@/features/products/ProductForm";
import { useProduct, useProducts, useVariantGroups } from "@/features/products/use-products";
import { colors, layout, space } from "@/theme";

export default function EditProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const products = useProducts();
  const product = useProduct(productId);
  const variants = useVariantGroups(product ? productId : null);

  if (products.isPending || (product && variants.isPending)) {
    return (
      <View style={styles.center}>
        <Spinner size="large" />
      </View>
    );
  }
  if (variants.error) {
    return (
      <View style={styles.pad}>
        <Alert tone="error" message={errorMessage(variants.error)} />
        <Button label="Kembali" variant="secondary" fullWidth onPress={() => router.back()} />
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="tag-remove-outline"
          title="Item tidak ditemukan"
          description="Item ini tidak ada di Lapak kamu."
          action={
            <Button label="Kembali" variant="secondary" fullWidth onPress={() => router.back()} />
          }
        />
      </View>
    );
  }
  // Form dibuat sekali setelah varian termuat; refetch sesudah simpan tidak membuat ulang form.
  return (
    <ProductForm key={product.id} product={product} initialGroups={variants.data?.groups ?? []} />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  pad: {
    flex: 1,
    padding: layout.screenPaddingX,
    paddingTop: space.xxxl,
    gap: space.md,
    backgroundColor: colors.bg,
  },
});
