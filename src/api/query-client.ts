import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./client";

const MAX_GET_RETRIES = 2;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Query = GET. Hanya gangguan sementara yang dicoba ulang; 4xx langsung ditampilkan.
        retry: (failureCount, error) =>
          failureCount < MAX_GET_RETRIES && error instanceof ApiError && error.isTransient,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  });
}
