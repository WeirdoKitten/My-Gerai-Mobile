import { z } from "zod";

// Mengikuti tipe di repo web: MerchantProfileView, MerchantDeliverySettingsView,
// QrMenuView (src/types/merchant.ts), MerchantEventInfo (src/types/event.ts),
// PlaceSuggestion (src/types/maps.ts).

export const profileSchema = z.object({
  stallName: z.string(),
  ownerName: z.string(),
  category: z.string(),
  phone: z.string(),
  photoUrl: z.string().nullable(),
  payoutAccountInfo: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;

// Meniru updateMerchantProfileSchema web untuk pesan cepat; server tetap memvalidasi.
export const profileInputSchema = z.object({
  stallName: z.string().trim().min(1, "Nama Lapak wajib diisi.").max(100),
  ownerName: z.string().trim().min(1, "Nama Pedagang wajib diisi.").max(100),
  category: z.string().trim().min(1, "Kategori wajib diisi.").max(50),
  photoUrl: z.string().nullable(),
  address: z.string().trim().max(200, "Alamat maksimal 200 karakter.").optional(),
  payoutAccountInfo: z.string().trim().max(300, "Info rekening maksimal 300 karakter.").optional(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const deliverySettingsSchema = z.object({
  deliveryEnabled: z.boolean(),
  deliveryFee: z.number().int().nullable(),
  deliveryRadiusKm: z.number(),
  hasLocation: z.boolean(),
});

export type DeliverySettings = z.infer<typeof deliverySettingsSchema>;

// Meniru updateMerchantDeliverySettingsSchema web.
export const deliveryInputSchema = z
  .object({
    deliveryEnabled: z.boolean(),
    deliveryFee: z
      .number()
      .int("Ongkir harus bilangan bulat.")
      .min(0, "Ongkir tidak boleh negatif.")
      .max(100_000, "Ongkir maksimal Rp100.000.")
      .nullable(),
    deliveryRadiusKm: z
      .number({ error: "Isi jangkauan dalam km." })
      .min(0.5, "Jangkauan minimal 0,5 km.")
      .max(20, "Jangkauan maksimal 20 km."),
  })
  .refine((data) => !data.deliveryEnabled || data.deliveryFee !== null, {
    message: "Isi Ongkir dulu sebelum mengaktifkan pesanan antar.",
    path: ["deliveryFee"],
  });

export type DeliveryInput = z.infer<typeof deliveryInputSchema>;

export const qrMenuSchema = z.object({
  url: z.string(),
  /** Poster SVG sebagai data URI (`data:image/svg+xml;...`). */
  qrImageUrl: z.string(),
});

export type QrMenu = z.infer<typeof qrMenuSchema>;

export const merchantEventSchema = z.object({
  name: z.string(),
  slug: z.string(),
  organizationName: z.string(),
  isActive: z.boolean(),
});

export const merchantEventListSchema = z.object({ events: z.array(merchantEventSchema) });

export type MerchantEvent = z.infer<typeof merchantEventSchema>;

export const coordinatesSchema = z.object({ latitude: z.number(), longitude: z.number() });

export type Coordinates = z.infer<typeof coordinatesSchema>;

export const placeSuggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  coords: coordinatesSchema.nullable(),
});

export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

export const placeSearchSchema = z.object({ suggestions: z.array(placeSuggestionSchema) });

export const reverseGeocodeSchema = z.object({ address: z.string().nullable() });
