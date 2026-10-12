import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";

import {
  getOrderHistory,
  getOrderQueue,
  markDeliveryFailed,
  markOrderPaid,
  updateOrderStatus,
} from "@/api/endpoints/orders";
import type { ActiveOrder, DeliveryFailureReason, HistoryOrder } from "@/api/schemas/orders";
import { useToast } from "@/components/ui";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types/order-status";

import { orderKeys } from "./order-keys";
import { needsAttention } from "./order-status";

// Web memakai 5 detik. 10 detik menghemat baterai dan kuota; push (Tahap 1b) menutup jedanya.
const QUEUE_POLL_MS = 10_000;

export function useOrderQueue() {
  const focused = useIsFocused();
  return useQuery({
    queryKey: orderKeys.queue(),
    queryFn: getOrderQueue,
    refetchInterval: focused ? QUEUE_POLL_MS : false,
    staleTime: 5_000,
  });
}

export function useOrderHistory(enabled = true) {
  return useQuery({ queryKey: orderKeys.history(), queryFn: getOrderHistory, enabled });
}

export type OrderLookup =
  | { kind: "active"; order: ActiveOrder }
  | { kind: "history"; order: HistoryOrder }
  | { kind: "missing" }
  | { kind: "loading" };

/** Tidak ada GET /orders/{id}: cari di antrean, lalu di riwayat. */
export function useOrderLookup(orderId: string): OrderLookup {
  const queue = useOrderQueue();
  const active = queue.data?.orders.find((o) => o.id === orderId);
  const searchHistory = queue.isSuccess && !active;
  const history = useOrderHistory(searchHistory);
  if (active) return { kind: "active", order: active };
  const past = history.data?.orders.find((o) => o.id === orderId);
  if (past) return { kind: "history", order: past };
  if (queue.isPending || (searchHistory && history.isPending)) return { kind: "loading" };
  return { kind: "missing" };
}

type OrderRef = { id: string; orderCode: string };

export function useOrderActions() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const refresh = () => queryClient.invalidateQueries({ queryKey: orderKeys.all });

  const advance = useMutation({
    mutationFn: ({ order, to }: { order: OrderRef; to: OrderStatus }) =>
      updateOrderStatus(order.id, to),
    onSuccess: (_data, { order, to }) => {
      showToast(`Pesanan ${order.orderCode} ditandai ${ORDER_STATUS_LABEL[to]}`);
      return refresh();
    },
  });

  const markPaid = useMutation({
    mutationFn: ({ order }: { order: OrderRef }) => markOrderPaid(order.id),
    onSuccess: (_data, { order }) => {
      showToast(`Pesanan ${order.orderCode} ditandai lunas`);
      return refresh();
    },
  });

  const deliveryFailed = useMutation({
    mutationFn: ({
      order,
      reason,
      note,
    }: {
      order: OrderRef;
      reason: DeliveryFailureReason;
      note: string;
    }) => markDeliveryFailed(order.id, { reason, note: note.trim() || undefined }),
    onSuccess: (_data, { order }) => {
      showToast(`Pesanan ${order.orderCode} ditandai gagal diantar`);
      return refresh();
    },
  });

  return { advance, markPaid, deliveryFailed };
}

/** Jumlah Pesanan yang menunggu tindakan, untuk badge tab. Membaca cache antrean tanpa polling sendiri. */
export function useAttentionCount(): number {
  const { data } = useQuery({
    queryKey: orderKeys.queue(),
    queryFn: getOrderQueue,
    select: (queue) => queue.orders.filter(needsAttention).length,
  });
  return data ?? 0;
}
