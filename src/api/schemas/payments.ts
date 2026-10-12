import { z } from "zod";

// Mengikuti MerchantPaymentSettingsView (src/types/merchant.ts) dan
// MerchantServiceFeeInvoiceView (src/types/service-fee-invoice.ts) di repo web.

export const paymentSettingsSchema = z.object({
  /** Hanya Admin yang mengubah mode; aplikasi menampilkan saja. */
  paymentMode: z.enum(["gateway", "qris_pribadi"]),
  qrisPhotoUrl: z.string().nullable(),
  storefrontLocked: z.boolean(),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export const INVOICE_STATUSES = ["belum_lunas", "lunas", "dibatalkan"] as const;

export const serviceFeeInvoiceSchema = z.object({
  id: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  /** Nominal tagihan dari server (Rupiah, bilangan bulat). */
  amount: z.number().int(),
  dueAt: z.string(),
  status: z.enum(INVOICE_STATUSES),
  paidAt: z.string().nullable(),
  /** Data URI PNG atau URL https gambar QR. Hanya terisi untuk `belum_lunas`. */
  qrImageUrl: z.string().nullable(),
});

export type ServiceFeeInvoice = z.infer<typeof serviceFeeInvoiceSchema>;

export const invoiceListSchema = z.object({ invoices: z.array(serviceFeeInvoiceSchema) });
