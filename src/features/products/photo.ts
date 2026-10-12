import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.7;

export type PickResult =
  | { kind: "picked"; uri: string }
  | { kind: "cancelled" }
  | { kind: "denied"; message: string };

/** Ambil foto dari galeri atau kamera, lalu perkecil di HP sebelum diunggah (hemat kuota). */
export async function pickPhoto(source: "gallery" | "camera"): Promise<PickResult> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      kind: "denied",
      message:
        source === "camera"
          ? "Izin kamera ditolak. Aktifkan di Pengaturan HP > Aplikasi > MyGerai > Izin."
          : "Izin galeri ditolak. Aktifkan di Pengaturan HP > Aplikasi > MyGerai > Izin.",
    };
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { kind: "cancelled" };

  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_EDGE) {
    context.resize(asset.width >= asset.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  return { kind: "picked", uri: saved.uri };
}
