import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/api/endpoints/me";

export const meKeys = { me: () => ["me"] as const };

export function useMe() {
  return useQuery({ queryKey: meKeys.me(), queryFn: getMe, staleTime: 5 * 60_000 });
}
