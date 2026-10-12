import { z } from "zod";

// Mengikuti MerchantSalesReport (src/types/report.ts) dan MerchantReviewsPage
// (src/types/review.ts) di repo web. Semua angka uang/persen dihitung server.

export const REPORT_PERIODS = ["hari_ini", "7_hari", "30_hari"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

const insightKinds = [
  "restock",
  "item_mati",
  "jam_ramai",
  "hari_sepi",
  "fokus_menu",
  "sering_bareng",
  "harga",
] as const;

export const salesReportSchema = z.object({
  period: z.enum(REPORT_PERIODS),
  summary: z.object({
    orderCount: z.number(),
    revenue: z.number(),
    platformFeeTotal: z.number(),
    deliveryFeeTotal: z.number(),
    buyerTotal: z.number(),
    avgOrderValue: z.number(),
    profit: z.number(),
    profitIncomplete: z.boolean(),
  }),
  delta: z.object({
    revenuePct: z.number().nullable(),
    orderCountPct: z.number().nullable(),
    profitPct: z.number().nullable(),
  }),
  daily: z.array(z.object({ date: z.string(), revenue: z.number(), orderCount: z.number() })),
  topItems: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      qtySold: z.number(),
      revenue: z.number(),
      revenueShare: z.number(),
    }),
  ),
  insights: z.array(
    z.object({
      // Jenis baru dari server tetap diterima; ikonnya memakai bawaan.
      kind: z.union([z.enum(insightKinds), z.string()]),
      title: z.string(),
      body: z.string(),
      priority: z.number(),
    }),
  ),
  insightsPending: z.boolean(),
});

export type SalesReport = z.infer<typeof salesReportSchema>;
export type DailySales = SalesReport["daily"][number];

export const reviewsPageSchema = z.object({
  summary: z.object({ average: z.number().nullable(), count: z.number() }),
  distribution: z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()]),
  reviews: z.array(
    z.object({
      id: z.string(),
      rating: z.number(),
      comment: z.string().nullable(),
      buyerName: z.string(),
      orderCode: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export type ReviewsPage = z.infer<typeof reviewsPageSchema>;
