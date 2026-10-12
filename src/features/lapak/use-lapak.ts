import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOpenStatus, setOpenState, setOperatingHours } from "@/api/endpoints/lapak";
import type { OpenStatus, OperatingHoursRow } from "@/api/schemas/lapak";
import { useToast } from "@/components/ui";

export const lapakKeys = { openStatus: () => ["lapak", "open-status"] as const };

export function useOpenStatus() {
  return useQuery({ queryKey: lapakKeys.openStatus(), queryFn: getOpenStatus, staleTime: 60_000 });
}

export function useSetOpenState() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (open: boolean) => setOpenState(open ? "open" : "closed"),
    // Optimistik seperti OpenToggle web: langsung berubah, kembali kalau gagal.
    onMutate: async (open) => {
      await queryClient.cancelQueries({ queryKey: lapakKeys.openStatus() });
      const previous = queryClient.getQueryData<OpenStatus>(lapakKeys.openStatus());
      if (previous) {
        queryClient.setQueryData<OpenStatus>(lapakKeys.openStatus(), {
          ...previous,
          isOpen: open,
          manualOverride: open ? "open" : "closed",
        });
      }
      return { previous };
    },
    onError: (_error, _open, context) => {
      if (context?.previous) queryClient.setQueryData(lapakKeys.openStatus(), context.previous);
    },
    onSuccess: (_data, open) => showToast(open ? "Lapak dibuka" : "Lapak ditutup"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: lapakKeys.openStatus() }),
  });
}

export function useSaveOperatingHours() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (hours: OperatingHoursRow[]) => setOperatingHours(hours),
    onSuccess: () => {
      showToast("Jadwal disimpan");
      return queryClient.invalidateQueries({ queryKey: lapakKeys.openStatus() });
    },
  });
}
