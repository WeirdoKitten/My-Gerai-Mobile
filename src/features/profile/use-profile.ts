import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDeliverySettings,
  getMerchantEvents,
  getProfile,
  getQrMenu,
  updateDeliverySettings,
  updateProfile,
} from "@/api/endpoints/profile";
import type { DeliveryInput, ProfileInput } from "@/api/schemas/profile";
import { useToast } from "@/components/ui";

import { meKeys } from "./use-me";

export const profileKeys = {
  profile: () => ["profile"] as const,
  delivery: () => ["profile", "delivery"] as const,
  qrMenu: () => ["profile", "qr-menu"] as const,
  events: () => ["profile", "events"] as const,
};

export function useProfile() {
  return useQuery({ queryKey: profileKeys.profile(), queryFn: getProfile });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: ProfileInput) => updateProfile(input),
    onSuccess: () => {
      showToast("Profil disimpan");
      // Nama Lapak & titik lokasi dipakai di layar lain (Profil, Pengantaran, QR Menu).
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: profileKeys.delivery() }),
        queryClient.invalidateQueries({ queryKey: profileKeys.qrMenu() }),
        queryClient.invalidateQueries({ queryKey: meKeys.me() }),
      ]);
    },
  });
}

export function useDeliverySettings() {
  return useQuery({ queryKey: profileKeys.delivery(), queryFn: getDeliverySettings });
}

export function useSaveDeliverySettings() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: DeliveryInput) => updateDeliverySettings(input),
    onSuccess: () => {
      showToast("Pengaturan antar disimpan");
      return queryClient.invalidateQueries({ queryKey: profileKeys.delivery() });
    },
  });
}

export function useQrMenu() {
  // Poster tidak berubah kecuali nama Lapak berubah; simpan lama di cache.
  return useQuery({ queryKey: profileKeys.qrMenu(), queryFn: getQrMenu, staleTime: 30 * 60_000 });
}

export function useMerchantEvents() {
  return useQuery({
    queryKey: profileKeys.events(),
    queryFn: getMerchantEvents,
    staleTime: 10 * 60_000,
  });
}
