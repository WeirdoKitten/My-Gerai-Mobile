import { z } from "zod";

// Mengikuti MerchantProductView / ProductVariantGroupView di repo web (src/types/product.ts).
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().int(),
  costPrice: z.number().int().nullable(),
  stock: z.number().int().nullable(),
  photoUrl: z.string().nullable(),
  status: z.enum(["available", "sold_out"]),
  preOrder: z.object({ minDays: z.number().int(), maxDays: z.number().int() }).nullable(),
});

export const productListSchema = z.object({ products: z.array(productSchema) });

export const variantGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  options: z.array(z.object({ id: z.string(), name: z.string(), priceDelta: z.number().int() })),
});

export const variantGroupListSchema = z.object({ groups: z.array(variantGroupSchema) });

export const createProductResultSchema = z.object({ productId: z.string() });

export const uploadPhotoResultSchema = z.object({ url: z.string() });

export type Product = z.infer<typeof productSchema>;
export type VariantGroup = z.infer<typeof variantGroupSchema>;

// Meniru createProductSchema web hanya untuk pesan cepat; server tetap memvalidasi.
const PRODUCT_PHOTO_URL_PATTERN = /^\/uploads\/products\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "Nama Item wajib diisi.").max(100),
    description: z.string().trim().max(500).optional(),
    price: z.number().int().min(0, "Harga tidak boleh negatif.").max(100_000_000),
    costPrice: z
      .number()
      .int()
      .min(0, "Harga modal tidak boleh negatif.")
      .max(100_000_000)
      .nullable(),
    stock: z.number().int().min(0, "Stok tidak boleh negatif.").max(1_000_000).nullable(),
    photoUrl: z.string().regex(PRODUCT_PHOTO_URL_PATTERN, "Foto tidak valid.").nullable(),
    preOrderMinDays: z
      .number()
      .int()
      .min(1, "Waktu pembuatan minimal 1 hari.")
      .max(30, "Waktu pembuatan maksimal 30 hari.")
      .nullable(),
    preOrderMaxDays: z.number().int().max(90, "Batas pesan ke depan maksimal 90 hari.").nullable(),
  })
  .superRefine((data, ctx) => {
    const min = data.preOrderMinDays;
    const max = data.preOrderMaxDays;
    if ((min === null) !== (max === null)) {
      ctx.addIssue({
        code: "custom",
        path: ["preOrderMaxDays"],
        message: "Isi waktu pembuatan dan batas pesan ke depan untuk Item pre-order.",
      });
    } else if (min !== null && max !== null && max < min) {
      ctx.addIssue({
        code: "custom",
        path: ["preOrderMaxDays"],
        message: "Batas pesan ke depan tidak boleh lebih kecil dari waktu pembuatan.",
      });
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

// Meniru saveProductVariantGroupsSchema web.
export const variantGroupsInputSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1, "Nama grup varian wajib diisi.").max(50),
      options: z
        .array(
          z.object({
            name: z.string().trim().min(1, "Nama pilihan wajib diisi.").max(50),
            priceDelta: z.number().int().min(-100_000_000).max(100_000_000),
          }),
        )
        .min(1, "Setiap grup varian butuh minimal 1 pilihan.")
        .max(20),
    }),
  )
  .max(10);

export type VariantGroupsInput = z.infer<typeof variantGroupsInputSchema>;
