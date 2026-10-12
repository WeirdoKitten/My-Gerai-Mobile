import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiRequest } from "@/api/client";
import { logout } from "@/api/endpoints/auth";
import { metaSchema } from "@/api/schemas/meta";
import { AuthProvider, SESSION_EXPIRED_NOTICE, useAuth } from "@/lib/auth/AuthProvider";

const mockStore = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockStore.delete(key);
  }),
}));

jest.mock("@/api/endpoints/auth", () => ({ logout: jest.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mockStore.clear();
  process.env.EXPO_PUBLIC_API_URL = "http://api.test/api/mobile/v1";
});

async function signedInHook() {
  const hook = await renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.status).toBe("signedOut"));
  await act(() => hook.result.current.signIn("token-rahasia"));
  return hook;
}

describe("AuthProvider", () => {
  it("menyimpan token dan mengirimnya sebagai Bearer", async () => {
    const { result } = await signedInHook();
    expect(result.current.status).toBe("signedIn");
    expect(mockStore.size).toBe(1);

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: { apiVersion: 1, minAppVersion: "0.0.0" } }),
    });
    await apiRequest("/meta", { schema: metaSchema });
    const init = (globalThis.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers.authorization).toBe("Bearer token-rahasia");
  });

  it("401 menghapus token dan menampilkan notice sesi berakhir", async () => {
    const { result } = await signedInHook();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, error: { code: "unauthorized", message: "x" } }),
    });
    await act(async () => {
      await apiRequest("/orders", { schema: metaSchema }).catch(() => {});
    });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));
    expect(result.current.notice).toBe(SESSION_EXPIRED_NOTICE);
    expect(mockStore.size).toBe(0);
  });

  it("tetap keluar lokal walau logout ke server gagal", async () => {
    (logout as jest.Mock).mockRejectedValueOnce(new Error("offline"));
    const { result } = await signedInHook();
    await act(() => result.current.signOut());
    expect(result.current.status).toBe("signedOut");
    expect(mockStore.size).toBe(0);
  });
});
