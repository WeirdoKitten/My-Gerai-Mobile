import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { colors } from "@/theme";

/** Id channel wajib sama dengan `channelId` push dari server (API-MOBILE §5). */
export const ORDER_CHANNEL_ID = "pesanan";

/**
 * `ask` = belum diizinkan tapi masih boleh ditanya (Android 13+ melapor `denied` sebelum
 * pernah ditanya); `blocked` = ditolak permanen, hanya bisa dinyalakan dari Pengaturan.
 */
export type PushPermission = "granted" | "ask" | "blocked";

/**
 * Channel Android untuk Pesanan: prioritas tertinggi dan bunyi sama dengan web. Bunyi
 * channel tidak bisa diubah setelah dibuat; ganti bunyi = channel id baru.
 */
export async function ensureOrderChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ORDER_CHANNEL_ID, {
    name: "Pesanan baru",
    description: "Bunyi saat ada Pesanan yang sudah dibayar.",
    importance: Notifications.AndroidImportance.MAX,
    sound: "order_chime.wav",
    vibrationPattern: [0, 300, 200, 300],
    lightColor: colors.brand,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function toPermission({ status, canAskAgain }: Notifications.NotificationPermissionsStatus) {
  if (status === "granted") return "granted";
  return canAskAgain ? "ask" : "blocked";
}

export async function getPushPermission(): Promise<PushPermission> {
  return toPermission(await Notifications.getPermissionsAsync());
}

export async function requestPushPermission(): Promise<PushPermission> {
  return toPermission(await Notifications.requestPermissionsAsync());
}

/** Token Expo Push untuk HP ini (`ExponentPushToken[...]`). Butuh izin notifikasi. */
export async function getExpoPushToken(): Promise<string> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) throw new Error("projectId EAS belum diisi di app.config.ts");
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ambil id Pesanan dari data push `order_paid`. Data push tidak dipercaya mentah:
 * hanya UUID yang diterima, supaya notifikasi palsu tidak bisa membuka rute lain.
 */
export function orderIdFromNotification(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const { type, orderId } = data as { type?: unknown; orderId?: unknown };
  if (type !== "order_paid" || typeof orderId !== "string") return null;
  return UUID.test(orderId) ? orderId : null;
}
