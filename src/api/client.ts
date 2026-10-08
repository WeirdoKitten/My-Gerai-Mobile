import { z } from "zod";

// Kode dari server (API-MOBILE §3) + kode yang hanya terjadi di sisi aplikasi.
export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "rate_limited"
  | "server_error"
  | "network"
  | "timeout"
  | "invalid_response";

const SERVER_CODES = [
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "validation",
  "rate_limited",
  "server_error",
] as const;

const FALLBACK_MESSAGE: Record<ApiErrorCode, string> = {
  bad_request: "Permintaan tidak bisa diproses.",
  unauthorized: "Sesi berakhir, silakan login kembali.",
  forbidden: "Kamu tidak punya akses untuk ini.",
  not_found: "Data tidak ditemukan.",
  validation: "Periksa lagi isian kamu.",
  rate_limited: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  server_error: "Server sedang bermasalah. Coba lagi beberapa saat lagi.",
  network: "Tidak ada koneksi internet. Periksa sinyal lalu coba lagi.",
  timeout: "Koneksi terlalu lambat. Coba lagi.",
  invalid_response: "Terjadi kesalahan. Coba lagi beberapa saat lagi.",
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;

  constructor(code: ApiErrorCode, message: string | undefined, status: number | null) {
    super(message ?? FALLBACK_MESSAGE[code]);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  /** Gangguan sementara yang aman dicoba ulang untuk GET. */
  get isTransient(): boolean {
    return this.code === "network" || this.code === "timeout" || this.code === "server_error";
  }
}

const errorEnvelope = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

const successEnvelope = z.object({ ok: z.literal(true), data: z.unknown() });

const DEFAULT_TIMEOUT_MS = 15_000;

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "bad_request";
}

function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error("EXPO_PUBLIC_API_URL belum diisi. Salin .env.example ke .env.");
  }
  return url.replace(/\/+$/, "");
}

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: UnauthorizedHandler = () => {};

/** Diisi oleh AuthProvider (Tahap 1). */
export function configureApiClient(options: {
  getToken: TokenProvider;
  onUnauthorized: UnauthorizedHandler;
}) {
  tokenProvider = options.getToken;
  unauthorizedHandler = options.onUnauthorized;
}

type RequestOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema: z.ZodType<T>;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const { method = "GET", body, schema, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;

  const controller = new AbortController();
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener("abort", onCallerAbort);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const headers: Record<string, string> = { accept: "application/json" };
  const token = tokenProvider();
  if (token) headers.authorization = `Bearer ${token}`;

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["content-type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(timedOut ? "timeout" : "network", undefined, null);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      response.ok ? "invalid_response" : codeFromStatus(response.status),
      undefined,
      response.status,
    );
  }

  if (!response.ok) {
    const parsed = errorEnvelope.safeParse(json);
    const serverCode = parsed.success ? parsed.data.error.code : undefined;
    const code = SERVER_CODES.find((c) => c === serverCode) ?? codeFromStatus(response.status);
    if (code === "unauthorized") unauthorizedHandler();
    throw new ApiError(
      code,
      parsed.success ? parsed.data.error.message : undefined,
      response.status,
    );
  }

  const envelope = successEnvelope.safeParse(json);
  if (!envelope.success) {
    console.error(`[api] ${method} ${path}: envelope tidak sesuai kontrak`);
    throw new ApiError("invalid_response", undefined, response.status);
  }

  const data = schema.safeParse(envelope.data.data);
  if (!data.success) {
    console.error(`[api] ${method} ${path}: data tidak sesuai skema`, data.error.issues);
    throw new ApiError("invalid_response", undefined, response.status);
  }
  return data.data;
}
