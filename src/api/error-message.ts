import { ApiError } from "./client";

/** Pesan yang aman ditampilkan ke Pedagang untuk error apa pun dari lapisan API. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi.";
}
