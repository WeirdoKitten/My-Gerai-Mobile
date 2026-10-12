const PREFIX = "data:image/svg+xml;base64,";

/**
 * Isi XML dari data URI SVG base64 (poster QR dari server). Didekode sebagai UTF-8 supaya
 * nama Lapak beraksara non-ASCII tetap benar. `null` kalau formatnya bukan SVG base64.
 */
export function decodeSvgDataUri(dataUri: string): string | null {
  if (!dataUri.startsWith(PREFIX)) return null;
  try {
    const binary = atob(dataUri.slice(PREFIX.length));
    const percentEncoded = Array.from(
      binary,
      (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`,
    ).join("");
    const xml = decodeURIComponent(percentEncoded);
    return xml.trimStart().startsWith("<svg") ? xml : null;
  } catch {
    return null;
  }
}

const NESTED_SVG =
  /<svg x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="[\d.]+" viewBox="0 0 ([\d.]+) [\d.]+"([^>]*)>([\s\S]*?)<\/svg>/g;

/**
 * Sesuaikan poster SVG server untuk `SvgXml` (react-native-svg):
 * - `<svg>` bersarang (ikon toko di tengah QR) diganti `<g transform>`, karena posisi x/y-nya
 *   diabaikan dan elemen sesudahnya ikut terpotong di dalamnya.
 * - `&amp;` dan `&quot;` di teks dikembalikan, karena parser native tidak mendekode entitas.
 */
export function adaptPosterSvg(xml: string): string {
  return xml
    .replace(NESTED_SVG, (_match, x, y, width, viewBoxWidth, attrs, inner) => {
      const scale = Number(width) / Number(viewBoxWidth);
      return `<g transform="translate(${x} ${y}) scale(${scale})"${attrs}>${inner}</g>`;
    })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}
