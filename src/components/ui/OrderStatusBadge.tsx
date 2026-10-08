import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types/order-status";

import { Badge, type BadgeTone } from "./Badge";

const statusTone: Record<OrderStatus, BadgeTone> = {
  menunggu_pembayaran: "warning",
  dibayar: "info",
  diproses: "info",
  siap_diambil: "success",
  selesai: "neutral",
  dibatalkan: "danger",
  kedaluwarsa: "neutral",
  sedang_diantar: "primary",
  gagal_diantar: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={ORDER_STATUS_LABEL[status]} tone={statusTone[status]} dot />;
}
