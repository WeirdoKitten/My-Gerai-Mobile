import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, EmptyState, ScreenHeader, Spinner } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { ProductRow } from "@/features/products/ProductRow";
import { useProducts, useSetProductStatus } from "@/features/products/use-products";
import { colors, layout, radius, space } from "@/theme";

export default function ItemScreen() {
  const products = useProducts();
  const setStatus = useSetProductStatus();
  const list = products.data?.products ?? [];
  const available = list.filter((p) => p.status === "available").length;

  const addButton = (
    <Button
      label="Tambah Item"
      size="lg"
      fullWidth
      icon={<MaterialCommunityIcons name="plus" size={22} color={colors.onBrand} />}
      onPress={() => router.push("/item/baru")}
    />
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="Item"
          subtitle={list.length > 0 ? `${available} dari ${list.length} Item tersedia` : undefined}
        />
      }
    >
      {products.isPending ? (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      ) : products.error && list.length === 0 ? (
        <View style={styles.pad}>
          <Alert tone="error" message={errorMessage(products.error)} />
          <Button
            label="Coba lagi"
            variant="secondary"
            fullWidth
            onPress={() => products.refetch()}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={list}
            keyExtractor={(p) => p.id}
            contentContainerStyle={list.length > 0 ? styles.list : styles.emptyList}
            style={styles.flex}
            ItemSeparatorComponent={Separator}
            renderItem={({ item }) => (
              <ProductRow
                product={item}
                toggling={setStatus.isPending && setStatus.variables?.product.id === item.id}
                onToggle={(next) => setStatus.mutate({ product: item, available: next })}
              />
            )}
            ListHeaderComponent={
              setStatus.error ? (
                <View style={styles.headerAlert}>
                  <Alert tone="error" message={errorMessage(setStatus.error)} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="tag-plus-outline"
                title="Belum ada Item"
                description="Tambahkan Item pertama supaya Pembeli bisa memesan dari QR Menu Lapak kamu."
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={products.isRefetching}
                onRefresh={() => products.refetch()}
                colors={[colors.brandStrong]}
              />
            }
          />
          <View style={styles.footer}>{addButton}</View>
        </>
      )}
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pad: { padding: layout.screenPaddingX, gap: space.md },
  list: {
    marginHorizontal: layout.screenPaddingX,
    marginTop: space.lg,
    marginBottom: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  headerAlert: { padding: space.md },
  separator: { height: 1, backgroundColor: colors.line, marginLeft: space.lg + 64 + space.md },
  footer: {
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
