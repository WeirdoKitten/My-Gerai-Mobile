import { z } from "zod";

export const loginResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("approved"), token: z.string().min(1) }),
  z.object({
    status: z.enum(["pending", "rejected", "suspended"]),
    message: z.string(),
  }),
]);

export type LoginResult = z.infer<typeof loginResultSchema>;

export const registerResultSchema = z.object({ message: z.string() });

export const emptyResultSchema = z.object({ message: z.string().optional() });

// Meniru registerMerchantSchema repo web hanya untuk pesan cepat; server tetap memvalidasi.
export const registerInputSchema = z.object({
  stallName: z.string().trim().min(1, "Nama Lapak wajib diisi.").max(100),
  ownerName: z.string().trim().min(1, "Nama Pedagang wajib diisi.").max(100),
  category: z.string().trim().min(1, "Kategori wajib diisi.").max(50),
  phone: z
    .string()
    .trim()
    .regex(/^08\d{8,11}$/, "Nomor HP tidak valid (contoh: 081234567890)."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
  phone: z.string().trim().min(1, "Nomor HP wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
