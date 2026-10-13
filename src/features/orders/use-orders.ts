import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";

import { ApiError } from "@/api/client";
import {
  getOrder,
  getOrderHistory,
  getOrderQueue,
  markDeliveryFailed,
  markOrderPaid,
  updateOrderStatus,
} from "@/api/endpoints/orders";
import type {
  ActiveOrder,
  DeliveryFailureReason,
  HistoryOrder,
  OrderDetail,
  OrderHistory,
  OrderQueue,
} from "@/api/schemas/orders";
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
  | { kind: "loading" }
  | { kind: "error"; error: unknown; retry: () => void };

/**
 * Detail satu Pesanan lewat GET /orders/{id} (juga untuk Pesanan yang dibuka dari notifikasi).
 * Selagi memuat, data dari cache antrean/riwayat langsung ditampilkan.
 */
export function useOrderLookup(orderId: string): OrderLookup {
  const queryClient = useQueryClient();
  const focused = useIsFocused();
  const detail = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    // Status bisa berubah dari HP/web lain; ikut irama antrean selama layar terbuka.
    refetchInterval: focused ? QUEUE_POLL_MS : false,
    placeholderData: (): OrderDetail | undefined => {
      const active = queryClient
        .getQueryData<OrderQueue>(orderKeys.queue())
        ?.orders.find((o) => o.id === orderId);
      if (active) return { kind: "active", order: active };
      const past = queryClient
        .getQueryData<OrderHistory>(orderKeys.history())
        ?.orders.find((o) => o.id === orderId);
      return past ? { kind: "history", order: past } : undefined;
    },
  });
  if (detail.data) return detail.data;
  if (detail.isPending) return { kind: "loading" };
  if (detail.error instanceof ApiError && detail.error.code === "not_found") {
    return { kind: "missing" };
  }
  return { kind: "error", error: detail.error, retry: () => void detail.refetch() };
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
