import type { z } from "zod";

/** Pesan error pertama per field dari hasil Zod, untuk ditampilkan di bawah tiap isian. */
export function fieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && result[key] === undefined) result[key] = issue.message;
  }
  return result;
}
