// Salinan dari repo web src/lib/utils/order-status.ts. Hanya untuk memilih tombol yang tampil;
// server tetap memeriksa setiap transisi. Jaga tetap identik dengan web.
import type { DeliveryFailureReason, FulfillmentMethod } from "@/api/schemas/orders";
import type { OrderStatus } from "@/types/order-status";

export const MERCHANT_ORDER_TRANSITIONS: Record<
  FulfillmentMethod,
  Partial<Record<OrderStatus, OrderStatus>>
> = {
  ambil_sendiri: {
    dibayar: "diproses",
    diproses: "siap_diambil",
    siap_diambil: "selesai",
  },
  antar: {
    dibayar: "diproses",
    diproses: "sedang_diantar",
    sedang_diantar: "selesai",
  },
};

export const MERCHANT_ACTION_LABEL: Record<
  FulfillmentMethod,
  Partial<Record<OrderStatus, string>>
> = {
  ambil_sendiri: {
    dibayar: "Tandai Diproses",
    diproses: "Tandai Siap Diambil",
    siap_diambil: "Tandai Selesai",
  },
  antar: {
    dibayar: "Tandai Diproses",
    diproses: "Mulai Antar",
    sedang_diantar: "Tandai Sudah Diterima",
  },
};

export const FULFILLMENT_METHOD_LABEL: Record<FulfillmentMethod, string> = {
  ambil_sendiri: "Ambil Sendiri",
  antar: "Diantar",
};

export const DELIVERY_FAILURE_REASON_LABEL: Record<DeliveryFailureReason, string> = {
  tidak_bisa_dihubungi: "Pembeli tidak bisa dihubungi",
  alamat_tidak_ditemukan: "Alamat tidak ditemukan",
  lainnya: "Lainnya",
};

export const DELIVERY_FAIL_MIN_MINUTES = 15;

export function nextMerchantStatus(
  current: OrderStatus,
  method: FulfillmentMethod,
): OrderStatus | null {
  return MERCHANT_ORDER_TRANSITIONS[method][current] ?? null;
}

/** Sisa menit sebelum Pedagang boleh menandai "Gagal Diantar" (0 = sudah boleh). */
export function minutesUntilDeliveryFailAllowed(
  deliveryStartedAt: string | null,
  now: Date = new Date(),
): number {
  if (!deliveryStartedAt) return DELIVERY_FAIL_MIN_MINUTES;
  const allowedAt = new Date(deliveryStartedAt).getTime() + DELIVERY_FAIL_MIN_MINUTES * 60_000;
  return Math.max(0, Math.ceil((allowedAt - now.getTime()) / 60_000));
}

/** Pesanan yang menunggu tindakan Pedagang: baru lunas, atau QRIS Pribadi yang perlu ditandai lunas. */
export function needsAttention(order: {
  status: OrderStatus;
  awaitingManualConfirmation: boolean;
}): boolean {
  return order.status === "dibayar" || order.awaitingManualConfirmation;
}
