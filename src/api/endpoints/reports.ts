import { apiRequest } from "../client";
import { type ReportPeriod, reviewsPageSchema, salesReportSchema } from "../schemas/reports";

export function getSalesReport(period: ReportPeriod) {
  return apiRequest(`/reports/sales?period=${period}`, { schema: salesReportSchema });
}

export function getReviews() {
  return apiRequest("/reviews", { schema: reviewsPageSchema });
}
