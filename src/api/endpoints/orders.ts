import type { OrderStatus } from "@/types/order-status";

import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";
import {
  type DeliveryFailureReason,
  orderDetailSchema,
  orderHistorySchema,
  orderQueueSchema,
  receiptResultSchema,
} from "../schemas/orders";

export function getOrderQueue() {
  return apiRequest("/orders", { schema: orderQueueSchema });
}

export function getOrderHistory() {
  return apiRequest("/orders/history", { schema: orderHistorySchema });
}

const orderPath = (orderId: string) => `/orders/${encodeURIComponent(orderId)}`;

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  return apiRequest(`${orderPath(orderId)}/status`, {
    method: "POST",
    body: { status },
    schema: emptyResultSchema,
  });
}

export function markOrderPaid(orderId: string) {
  return apiRequest(`${orderPath(orderId)}/mark-paid`, {
    method: "POST",
    schema: emptyResultSchema,
  });
}

export function markDeliveryFailed(
  orderId: string,
  input: { reason: DeliveryFailureReason; note?: string },
) {
  return apiRequest(`${orderPath(orderId)}/delivery-failed`, {
    method: "POST",
    body: input,
    schema: emptyResultSchema,
  });
}

/** Data struk Pesanan yang sudah dibayar. Byte ESC/POS disusun di HP (src/lib/receipt). */
export function getOrderReceipt(orderId: string) {
  return apiRequest(`${orderPath(orderId)}/receipt`, { schema: receiptResultSchema });
}

/** Satu Pesanan milik Lapak sendiri; Pesanan Lapak lain atau tidak ada = `not_found`. */
export function getOrder(orderId: string) {
  return apiRequest(orderPath(orderId), { schema: orderDetailSchema });
}
