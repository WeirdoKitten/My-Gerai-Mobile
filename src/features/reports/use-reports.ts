import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getReviews, getSalesReport } from "@/api/endpoints/reports";
import type { ReportPeriod } from "@/api/schemas/reports";

export const reportKeys = {
  sales: (period: ReportPeriod) => ["reports", "sales", period] as const,
  reviews: () => ["reports", "reviews"] as const,
};

export function useSalesReport(period: ReportPeriod) {
  return useQuery({
    queryKey: reportKeys.sales(period),
    queryFn: () => getSalesReport(period),
    // Ganti periode tidak mengosongkan layar; data lama tampil sampai yang baru datang.
    placeholderData: keepPreviousData,
  });
}

export function useReviews() {
  return useQuery({ queryKey: reportKeys.reviews(), queryFn: getReviews });
}
