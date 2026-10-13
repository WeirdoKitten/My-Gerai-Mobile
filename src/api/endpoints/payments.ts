import { apiRequest } from "../client";
import { invoiceListSchema, paymentSettingsSchema, payoutSummarySchema } from "../schemas/payments";

export function getPaymentSettings() {
  return apiRequest("/payment-settings", { schema: paymentSettingsSchema });
}

export function getServiceFeeInvoices() {
  return apiRequest("/service-fee-invoices", { schema: invoiceListSchema });
}

export function getPayoutSummary() {
  return apiRequest("/payouts", { schema: payoutSummarySchema });
}
