import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { registerPushToken } from "@/api/endpoints/devices";
import { Button, Sheet } from "@/components/ui";
import { orderKeys } from "@/features/orders/order-keys";
import {
  ensureOrderChannel,
  getExpoPushToken,
  getPushPermission,
  orderIdFromNotification,
  requestPushPermission,
} from "@/lib/notifications/push";

// Saat aplikasi terbuka, push tetap tampil sebagai banner dan berbunyi (keputusan User 2026-10-15).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const pushPermissionKey = ["notifications", "permission"] as const;

/** Status izin notifikasi; diperiksa ulang tiap aplikasi kembali aktif (mis. dari Pengaturan). */
export function usePushPermission() {
  return useQuery({ queryKey: pushPermissionKey, queryFn: getPushPermission, staleTime: 0 });
}

/** Minta izin (dialog Android), lalu perbarui status di semua layar. */
export async function askPushPermission(queryClient: QueryClient) {
  await requestPushPermission().catch(() => null);
  await queryClient.invalidateQueries({ queryKey: pushPermissionKey });
}

function openOrder(data: unknown) {
  const orderId = orderIdFromNotification(data);
  if (orderId) router.push({ pathname: "/pesanan/[orderId]", params: { orderId } });
}

/**
 * Dipasang sekali di layout tab (hanya saat sudah masuk): channel Pesanan, minta izin dengan
 * penjelasan, daftarkan token ke server, dan tangani notifikasi masuk atau diketuk.
 */
export function PushManager() {
  const queryClient = useQueryClient();
  const permission = usePushPermission();
  const [dismissed, setDismissed] = useState(false);
  const [asking, setAsking] = useState(false);
  const registered = useRef(false);

  const register = useMutation({
    mutationFn: async () => registerPushToken(await getExpoPushToken()),
    onSuccess: () => {
      registered.current = true;
    },
    onError: (error) => {
      // Tidak mengganggu Pedagang; antrean tetap di-poll. Dicoba lagi saat aplikasi aktif kembali.
      if (__DEV__) console.warn("[push] registrasi token gagal", String(error));
    },
  });

  useEffect(() => {
    void ensureOrderChannel();
  }, []);

  // Daftarkan token sekali per sesi masuk, setelah izin ada. Kalau gagal, dicoba lagi hanya saat
  // izin diperiksa ulang (aplikasi aktif kembali), bukan setiap render.
  const { mutate: registerToken } = register;
  const lastAttempt = useRef(0);
  const checkedAt = permission.dataUpdatedAt;
  useEffect(() => {
    if (permission.data !== "granted" || registered.current) return;
    if (lastAttempt.current === checkedAt) return;
    lastAttempt.current = checkedAt;
    registerToken();
  }, [permission.data, checkedAt, registerToken]);

  // Ketuk notifikasi: listener untuk aplikasi yang sedang hidup, hook untuk aplikasi yang
  // dibuka dari keadaan tertutup (cold start). Tiap notifikasi hanya ditangani sekali.
  const handled = useRef<string | null>(null);
  const handleTap = useCallback(
    (response: Notifications.NotificationResponse) => {
      const id = response.notification.request.identifier;
      if (handled.current === id) return;
      handled.current = id;
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      openOrder(response.notification.request.content.data);
      Notifications.clearLastNotificationResponse();
    },
    [queryClient],
  );

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    });
    const tapped = Notifications.addNotificationResponseReceivedListener(handleTap);
    return () => {
      received.remove();
      tapped.remove();
    };
  }, [queryClient, handleTap]);

  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (lastResponse) handleTap(lastResponse);
  }, [lastResponse, handleTap]);

  async function allow() {
    setAsking(true);
    await askPushPermission(queryClient);
    setAsking(false);
    setDismissed(true);
  }

  return (
    <Sheet
      visible={permission.data === "ask" && !dismissed}
      title="Nyalakan notifikasi Pesanan"
      description="Supaya Pesanan baru yang sudah dibayar langsung berbunyi, walau HP terkunci atau aplikasi tertutup."
      onClose={() => setDismissed(true)}
    >
      <Button label="Izinkan notifikasi" size="lg" fullWidth loading={asking} onPress={allow} />
      <Button label="Nanti saja" variant="ghost" fullWidth onPress={() => setDismissed(true)} />
    </Sheet>
  );
}
