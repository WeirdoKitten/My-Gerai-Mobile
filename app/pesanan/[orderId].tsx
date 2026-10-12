import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button, EmptyState, ScreenHeader, Spinner } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { ActiveOrderCard } from "@/features/orders/ActiveOrderCard";
import { HistoryOrderCard } from "@/features/orders/HistoryOrderCard";
import { useOrderLookup } from "@/features/orders/use-orders";
import { layout, space } from "@/theme";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const lookup = useOrderLookup(orderId);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/pesanan"));

  return (
    <Screen header={<ScreenHeader title="Detail Pesanan" onBack={goBack} />}>
      {lookup.kind === "loading" ? (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      ) : lookup.kind === "missing" ? (
        <EmptyState
          icon="receipt-text-remove-outline"
          title="Pesanan tidak ditemukan"
          description="Pesanan ini tidak ada di antrean maupun riwayat Lapak kamu."
          action={
            <Button label="Kembali ke Pesanan" variant="secondary" fullWidth onPress={goBack} />
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {lookup.kind === "active" ? (
            <ActiveOrderCard order={lookup.order} detailed />
          ) : (
            <HistoryOrderCard order={lookup.order} detailed />
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
  },
});
