import { z } from "zod";

export const meSchema = z.object({
  merchantId: z.string(),
  slug: z.string(),
  stallName: z.string(),
  profile: z.object({
    stallName: z.string(),
    ownerName: z.string(),
    category: z.string(),
    phone: z.string(),
    photoUrl: z.string().nullable(),
    address: z.string().nullable(),
  }),
});

export type Me = z.infer<typeof meSchema>;
