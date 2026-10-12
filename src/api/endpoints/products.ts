import { File } from "expo-file-system";

import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";
import {
  createProductResultSchema,
  type ProductInput,
  productListSchema,
  uploadPhotoResultSchema,
  type VariantGroupsInput,
  variantGroupListSchema,
} from "../schemas/products";

const UPLOAD_TIMEOUT_MS = 60_000;

const productPath = (productId: string) => `/products/${encodeURIComponent(productId)}`;

export function getProducts() {
  return apiRequest("/products", { schema: productListSchema });
}

export function createProduct(input: ProductInput) {
  return apiRequest("/products", {
    method: "POST",
    body: input,
    schema: createProductResultSchema,
  });
}

export function updateProduct(productId: string, input: ProductInput) {
  return apiRequest(productPath(productId), {
    method: "PATCH",
    body: input,
    schema: emptyResultSchema,
  });
}

export function setProductStatus(productId: string, status: "available" | "sold_out") {
  return apiRequest(`${productPath(productId)}/status`, {
    method: "POST",
    body: { status },
    schema: emptyResultSchema,
  });
}

export function getVariantGroups(productId: string) {
  return apiRequest(`${productPath(productId)}/variants`, { schema: variantGroupListSchema });
}

export function saveVariantGroups(productId: string, groups: VariantGroupsInput) {
  return apiRequest(`${productPath(productId)}/variants`, {
    method: "PUT",
    body: { groups },
    schema: emptyResultSchema,
  });
}

/** Unggah foto yang sudah dikompres di HP. Server menerima JPG/PNG/WebP maks 3 MB. */
export function uploadProductPhoto(uri: string) {
  const form = new FormData();
  // fetch bawaan Expo (expo/fetch) tidak menerima objek `{ uri }` ala React Native;
  // File dari expo-file-system adalah Blob yang bisa dikirim sebagai multipart.
  form.append("file", new File(uri), "foto.jpg");
  return apiRequest("/products/photo", {
    method: "POST",
    body: form,
    schema: uploadPhotoResultSchema,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}
