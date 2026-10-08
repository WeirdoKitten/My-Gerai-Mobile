import { z } from "zod";

import { ApiError, apiRequest, configureApiClient } from "@/api/client";

const schema = z.object({ apiVersion: z.number() });

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = "http://api.test/api/mobile/v1/";
  configureApiClient({ getToken: () => "token-123", onUnauthorized: jest.fn() });
});

describe("apiRequest", () => {
  it("mengirim Bearer token dan mengembalikan data yang lolos skema", async () => {
    mockFetch(200, { ok: true, data: { apiVersion: 1 } });
    await expect(apiRequest("/meta", { schema })).resolves.toEqual({ apiVersion: 1 });
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://api.test/api/mobile/v1/meta");
    expect(init.headers.authorization).toBe("Bearer token-123");
  });

  it("memakai pesan server dan memanggil onUnauthorized saat 401", async () => {
    const onUnauthorized = jest.fn();
    configureApiClient({ getToken: () => null, onUnauthorized });
    mockFetch(401, { ok: false, error: { code: "unauthorized", message: "Silakan login." } });
    const error = await apiRequest("/me", { schema }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "unauthorized", status: 401, message: "Silakan login." });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("menandai data yang tidak sesuai skema sebagai invalid_response", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockFetch(200, { ok: true, data: { apiVersion: "satu" } });
    await expect(apiRequest("/meta", { schema })).rejects.toMatchObject({
      code: "invalid_response",
    });
  });

  it("memetakan fetch gagal menjadi network", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed"));
    const error = await apiRequest("/meta", { schema }).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: "network", status: null });
    expect((error as ApiError).isTransient).toBe(true);
  });
});
