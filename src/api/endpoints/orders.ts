import type { OrderStatus } from "@/types/order-status";

import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";
import {
  type DeliveryFailureReason,
  orderHistorySchema,
  orderQueueSchema,
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
