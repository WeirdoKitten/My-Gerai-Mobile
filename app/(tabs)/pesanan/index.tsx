import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import type { ActiveOrder, HistoryOrder } from "@/api/schemas/orders";
import {
  Alert,
  Button,
  EmptyState,
  ScreenHeader,
  SegmentedControl,
  Spinner,
} from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { OpenStatusCard } from "@/features/lapak/OpenStatusCard";
import { PushDeniedBanner } from "@/features/notifications/PushDeniedBanner";
import { ActiveOrderCard } from "@/features/orders/ActiveOrderCard";
import { HistoryOrderCard } from "@/features/orders/HistoryOrderCard";
import { useOrderHistory, useOrderQueue } from "@/features/orders/use-orders";
import { useMe } from "@/features/profile/use-me";
import { colors, layout, space, type } from "@/theme";

type Tab = "aktif" | "riwayat";

const SEGMENTS = [
  { value: "aktif", label: "Aktif" },
  { value: "riwayat", label: "Riwayat" },
] as const;

export default function OrdersScreen() {
  const [tab, setTab] = useState<Tab>("aktif");
  const me = useMe();

  return (
    <Screen
      header={
        <>
          <ScreenHeader title="Pesanan" subtitle={me.data?.stallName} />
          <OpenStatusCard />
          <PushDeniedBanner />
          <SegmentedControl segments={SEGMENTS} value={tab} onChange={setTab} />
        </>
      }
    >
      {tab === "aktif" ? <ActiveList /> : <HistoryList />}
    </Screen>
  );
}

function ActiveList() {
  const queue = useOrderQueue();
  const orders = queue.data?.orders ?? [];
  const hidden = (queue.data?.totalActive ?? 0) - orders.length;

  return (
    <OrderList<ActiveOrder>
      data={orders}
      isPending={queue.isPending}
      error={queue.error}
      isRefetching={queue.isRefetching}
      onRefresh={() => queue.refetch()}
      renderItem={(order) => <ActiveOrderCard order={order} />}
      empty={
        <EmptyState
          icon="receipt-text-outline"
          title="Belum ada Pesanan masuk"
          description="Pesanan yang sudah dibayar Pembeli muncul di sini. Daftar ini diperbarui sendiri tiap beberapa detik."
        />
      }
      footer={
        hidden > 0 ? (
          <Text style={[type.caption, styles.more]}>
            +{hidden} Pesanan lain. Selesaikan Pesanan di atas untuk melihatnya.
          </Text>
        ) : null
      }
    />
  );
}

function HistoryList() {
  const history = useOrderHistory();
  return (
    <OrderList<HistoryOrder>
      data={history.data?.orders ?? []}
      isPending={history.isPending}
      error={history.error}
      isRefetching={history.isRefetching}
      onRefresh={() => history.refetch()}
      renderItem={(order) => <HistoryOrderCard order={order} />}
      empty={
        <EmptyState
          icon="history"
          title="Belum ada riwayat"
          description="Pesanan yang selesai, dibatalkan, atau kedaluwarsa tersimpan di sini."
        />
      }
    />
  );
}

type OrderListProps<T extends { id: string }> = {
  data: T[];
  isPending: boolean;
  error: Error | null;
  isRefetching: boolean;
  onRefresh: () => void;
  renderItem: (item: T) => React.ReactElement;
  empty: React.ReactElement;
  footer?: React.ReactElement | null;
};

function OrderList<T extends { id: string }>({
  data,
  isPending,
  error,
  isRefetching,
  onRefresh,
  renderItem,
  empty,
  footer,
}: OrderListProps<T>) {
  if (isPending) {
    return (
      <View style={styles.center}>
        <Spinner size="large" />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.errorWrap}>
        <Alert tone="error" message={errorMessage(error)} />
        <Button label="Coba lagi" variant="secondary" fullWidth onPress={onRefresh} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderItem(item)}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          colors={[colors.brandStrong]}
          progressBackgroundColor={colors.surface}
        />
      }
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorWrap: { padding: layout.screenPaddingX, gap: space.md },
  list: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
  },
  separator: { height: space.lg },
  more: { textAlign: "center", marginTop: space.xl },
});
