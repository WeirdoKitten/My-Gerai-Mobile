import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";

/** Daftarkan HP ini untuk push Pesanan lunas (API-MOBILE §2). Server mengikat token ke sesi login. */
export function registerPushToken(pushToken: string) {
  return apiRequest("/devices", { method: "PUT", body: { pushToken }, schema: emptyResultSchema });
}
