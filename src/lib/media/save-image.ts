import { File, Paths } from "expo-file-system";
import { Asset, requestPermissionsAsync } from "expo-media-library";
import * as Sharing from "expo-sharing";

export type SaveResult = { ok: true } | { ok: false; message: string };

const DENIED_MESSAGE =
  "Izin galeri ditolak. Aktifkan di Pengaturan HP > Aplikasi > MyGerai > Izin, lalu coba lagi.";

/**
 * Tulis gambar ke file cache supaya bisa disimpan ke galeri atau dibagikan.
 * `src`: data URI base64 (QR dari server), URL https (QR gateway), atau `file://` (hasil potret layar).
 */
export async function imageToFile(src: string, name: string): Promise<File> {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  if (src.startsWith("file://")) {
    // Salin dengan nama yang jelas supaya mudah dicari di galeri.
    await new File(src).copy(file);
    return file;
  }
  if (src.startsWith("data:")) {
    const base64 = src.slice(src.indexOf(",") + 1);
    file.write(base64, { encoding: "base64" });
    return file;
  }
  if (src.startsWith("https://")) {
    return File.downloadFileAsync(src, file, { idempotent: true });
  }
  throw new Error("Sumber gambar tidak didukung");
}

/** Simpan file gambar ke galeri HP (hanya izin tulis foto, tidak membaca galeri). */
export async function saveToGallery(file: File): Promise<SaveResult> {
  const permission = await requestPermissionsAsync(true, ["photo"]);
  if (!permission.granted) return { ok: false, message: DENIED_MESSAGE };
  await Asset.create(file.uri);
  return { ok: true };
}

/** Buka lembar Bagikan Android untuk file gambar. */
export async function shareImage(file: File, dialogTitle: string): Promise<SaveResult> {
  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, message: "HP ini tidak mendukung fitur bagikan." };
  }
  await Sharing.shareAsync(file.uri, { mimeType: "image/png", dialogTitle });
  return { ok: true };
}
