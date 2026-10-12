import { File } from "expo-file-system";

import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";
import { uploadPhotoResultSchema } from "../schemas/products";
import {
  type Coordinates,
  type DeliveryInput,
  deliverySettingsSchema,
  merchantEventListSchema,
  type ProfileInput,
  placeSearchSchema,
  profileSchema,
  qrMenuSchema,
  reverseGeocodeSchema,
} from "../schemas/profile";

const UPLOAD_TIMEOUT_MS = 60_000;

export function getProfile() {
  return apiRequest("/profile", { schema: profileSchema });
}

export function updateProfile(input: ProfileInput) {
  return apiRequest("/profile", { method: "PATCH", body: input, schema: emptyResultSchema });
}

function uploadImage(path: string, uri: string, filename: string) {
  const form = new FormData();
  form.append("file", new File(uri), filename);
  return apiRequest(path, {
    method: "POST",
    body: form,
    schema: uploadPhotoResultSchema,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

/** Foto sampul Lapak. URL hasil baru tersimpan setelah profil disimpan. */
export function uploadStallPhoto(uri: string) {
  return uploadImage("/profile/photo", uri, "foto.jpg");
}

/** Foto QRIS Pribadi. Langsung tersimpan di server (sama dengan web). */
export function uploadQrisPhoto(uri: string) {
  return uploadImage("/profile/qris-photo", uri, "qris.jpg");
}

export function getDeliverySettings() {
  return apiRequest("/delivery-settings", { schema: deliverySettingsSchema });
}

export function updateDeliverySettings(input: DeliveryInput) {
  return apiRequest("/delivery-settings", {
    method: "PATCH",
    body: input,
    schema: emptyResultSchema,
  });
}

export function getQrMenu() {
  return apiRequest("/qr-menu", { schema: qrMenuSchema });
}

export function getMerchantEvents() {
  return apiRequest("/events", { schema: merchantEventListSchema });
}

export function searchPlaces(query: string, near: Coordinates | null, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query });
  if (near) {
    params.set("lat", String(near.latitude));
    params.set("lng", String(near.longitude));
  }
  return apiRequest(`/places/search?${params.toString()}`, { schema: placeSearchSchema, signal });
}

export function reverseGeocode({ latitude, longitude }: Coordinates) {
  const params = new URLSearchParams({ lat: String(latitude), lng: String(longitude) });
  return apiRequest(`/places/reverse?${params.toString()}`, { schema: reverseGeocodeSchema });
}
