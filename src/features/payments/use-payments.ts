import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";

import { getPaymentSettings, getServiceFeeInvoices } from "@/api/endpoints/payments";
import { uploadQrisPhoto } from "@/api/endpoints/profile";
import { useToast } from "@/components/ui";

// Sama dengan web: cek status tiap 4 detik selama ada tagihan belum lunas dan layar terbuka.
const UNPAID_POLL_MS = 4_000;

export const paymentKeys = {
  settings: () => ["payments", "settings"] as const,
  invoices: () => ["payments", "invoices"] as const,
};

export function usePaymentSettings() {
  return useQuery({ queryKey: paymentKeys.settings(), queryFn: getPaymentSettings });
}

export function useServiceFeeInvoices() {
  const focused = useIsFocused();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: paymentKeys.invoices(),
    queryFn: async () => {
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof getServiceFeeInvoices>>>(
        paymentKeys.invoices(),
      );
      const next = await getServiceFeeInvoices();
      // Tagihan baru lunas → status kunci Lapak ikut berubah; ambil ulang pengaturan.
      const wasUnpaid = previous?.invoices.some((i) => i.status === "belum_lunas");
      const stillUnpaid = next.invoices.some((i) => i.status === "belum_lunas");
      if (wasUnpaid && !stillUnpaid) {
        void queryClient.invalidateQueries({ queryKey: paymentKeys.settings() });
      }
      return next;
    },
    refetchInterval: (query) =>
      focused && query.state.data?.invoices.some((i) => i.status === "belum_lunas")
        ? UNPAID_POLL_MS
        : false,
  });
}

/** Unggah foto QRIS Pribadi. Server langsung menyimpannya (sama dengan web). */
export function useUploadQrisPhoto() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: uploadQrisPhoto,
    onSuccess: () => {
      showToast("Foto QRIS disimpan");
      return queryClient.invalidateQueries({ queryKey: paymentKeys.settings() });
    },
  });
}
