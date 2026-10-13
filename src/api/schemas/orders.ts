import { z } from "zod";

import { ORDER_STATUSES } from "@/types/order-status";

// Mengikuti src/types/order.ts repo web. Tanggal datang sebagai string ISO (UTC).
const isoDate = z.string();

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const fulfillmentMethodSchema = z.enum(["ambil_sendiri", "antar"]);
export const deliveryFailureReasonSchema = z.enum([
  "tidak_bisa_dihubungi",
  "alamat_tidak_ditemukan",
  "lainnya",
]);

export const orderItemSchema = z.object({
  id: z.string(),
  productNameSnapshot: z.string(),
  priceSnapshot: z.number().int(),
  qty: z.number().int(),
  note: z.string().nullable(),
  variantSelections: z.array(
    z.object({
      groupNameSnapshot: z.string(),
      optionNameSnapshot: z.string(),
      priceDeltaSnapshot: z.number().int(),
    }),
  ),
});

export const orderDeliverySchema = z.object({
  buyerPhone: z.string(),
  address: z.string(),
  landmark: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  distanceKm: z.number().nullable(),
  startedAt: isoDate.nullable(),
  failureReason: deliveryFailureReasonSchema.nullable(),
  failureNote: z.string().nullable(),
});

export const activeOrderSchema = z.object({
  id: z.string(),
  orderCode: z.string(),
  status: orderStatusSchema,
  buyerName: z.string(),
  buyerNote: z.string().nullable(),
  createdAt: isoDate,
  items: z.array(orderItemSchema),
  fulfillmentMethod: fulfillmentMethodSchema,
  deliveryFeeSnapshot: z.number().int(),
  delivery: orderDeliverySchema.nullable(),
  scheduledFor: isoDate.nullable(),
  buyerPhone: z.string().nullable(),
  eventName: z.string().nullable(),
  awaitingManualConfirmation: z.boolean(),
});

export const orderQueueSchema = z.object({
  orders: z.array(activeOrderSchema),
  totalActive: z.number().int(),
});

export const historyOrderSchema = z.object({
  id: z.string(),
  orderCode: z.string(),
  status: orderStatusSchema,
  buyerName: z.string(),
  subtotal: z.number().int(),
  platformFeeSnapshot: z.number().int(),
  totalForMerchant: z.number().int(),
  createdAt: isoDate,
  paidAt: isoDate.nullable(),
  completedAt: isoDate.nullable(),
  items: z.array(orderItemSchema),
  deliveryFeeSnapshot: z.number().int(),
  fulfillmentMethod: fulfillmentMethodSchema,
  delivery: orderDeliverySchema.nullable(),
  scheduledFor: isoDate.nullable(),
  eventName: z.string().nullable(),
});

export const orderHistorySchema = z.object({ orders: z.array(historyOrderSchema) });

// Mengikuti OrderReceiptView (src/types/order.ts) repo web, dari GET /orders/{id}/receipt.
export const receiptSchema = z.object({
  stallName: z.string(),
  stallAddress: z.string().nullable(),
  orderCode: z.string(),
  buyerName: z.string(),
  buyerNote: z.string().nullable(),
  paidAt: isoDate,
  items: z.array(orderItemSchema),
  subtotal: z.number().int(),
  serviceFeePaid: z.number().int(),
  deliveryFee: z.number().int(),
  amountPaid: z.number().int(),
  scheduledFor: isoDate.nullable(),
  delivery: z
    .object({ buyerPhone: z.string(), address: z.string(), landmark: z.string().nullable() })
    .nullable(),
});

export const receiptResultSchema = z.object({ receipt: receiptSchema });

export type Receipt = z.infer<typeof receiptSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderDelivery = z.infer<typeof orderDeliverySchema>;
export type ActiveOrder = z.infer<typeof activeOrderSchema>;
export type OrderQueue = z.infer<typeof orderQueueSchema>;
export type HistoryOrder = z.infer<typeof historyOrderSchema>;
export type FulfillmentMethod = z.infer<typeof fulfillmentMethodSchema>;
export type DeliveryFailureReason = z.infer<typeof deliveryFailureReasonSchema>;
