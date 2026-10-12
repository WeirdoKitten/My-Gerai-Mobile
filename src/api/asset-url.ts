/**
 * Foto disimpan server sebagai path relatif (`/uploads/products/<uuid>.jpg`).
 * Ubah jadi URL penuh memakai origin server API. Path selain `/uploads/` ditolak.
 */
export function assetUrl(path: string): string | undefined {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base || !path.startsWith("/uploads/")) return undefined;
  const origin = base.match(/^https?:\/\/[^/]+/)?.[0];
  return origin ? `${origin}${path}` : undefined;
}
