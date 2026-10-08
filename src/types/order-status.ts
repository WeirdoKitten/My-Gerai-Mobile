// Salinan enum `order_status` dan label dari repo web (src/lib/utils/order-status.ts). Jaga tetap identik.
export const ORDER_STATUSES = [
  "menunggu_pembayaran",
  "dibayar",
  "diproses",
  "siap_diambil",
  "selesai",
  "dibatalkan",
  "kedaluwarsa",
  "sedang_diantar",
  "gagal_diantar",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  dibayar: "Dibayar",
  diproses: "Diproses",
  siap_diambil: "Siap Diambil",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  kedaluwarsa: "Kedaluwarsa",
  sedang_diantar: "Sedang Diantar",
  gagal_diantar: "Gagal Diantar",
};
