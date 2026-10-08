import { z } from "zod";

export const metaSchema = z.object({
  apiVersion: z.number().int(),
  minAppVersion: z.string(),
});

export type Meta = z.infer<typeof metaSchema>;
