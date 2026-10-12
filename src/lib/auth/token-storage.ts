import * as SecureStore from "expo-secure-store";

// Token login hanya di Android Keystore lewat secure-store (RULES §7). Jangan pernah di-log.
const TOKEN_KEY = "mygerai.session-token";

export function readToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function deleteToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
