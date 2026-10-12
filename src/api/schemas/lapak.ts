import { z } from "zod";

// Mengikuti MerchantOpenStatusView di repo web (src/types/merchant.ts).
const operatingHoursRowSchema = z.object({
  /** 0 = Minggu ... 6 = Sabtu (konvensi Postgres, sama dengan web). */
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
});

export const openStatusSchema = z.object({
  isOpen: z.boolean(),
  manualOverride: z.enum(["open", "closed"]).nullable(),
  reopensAt: z.string().nullable(),
  hours: z.array(operatingHoursRowSchema),
});

export type OpenStatus = z.infer<typeof openStatusSchema>;
export type OperatingHoursRow = z.infer<typeof operatingHoursRowSchema>;

// Meniru setOperatingHoursSchema web; server tetap memvalidasi.
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm.");

export const operatingHoursInputSchema = z
  .array(
    z
      .object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: timeSchema,
        closeTime: timeSchema,
      })
      .refine((row) => row.openTime !== row.closeTime, {
        message: "Jam buka dan tutup tidak boleh sama.",
        path: ["closeTime"],
      }),
  )
  .max(7, "Maksimal 7 baris (satu per hari).")
  .refine((rows) => new Set(rows.map((r) => r.dayOfWeek)).size === rows.length, {
    message: "Tiap hari cuma boleh punya satu jadwal.",
  });
