import { apiRequest } from "../client";
import {
  emptyResultSchema,
  type LoginInput,
  loginResultSchema,
  type RegisterInput,
  registerResultSchema,
} from "../schemas/auth";

export function login(input: LoginInput) {
  return apiRequest("/auth/login", { method: "POST", body: input, schema: loginResultSchema });
}

export function register(input: RegisterInput) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: input,
    schema: registerResultSchema,
  });
}

export function logout() {
  return apiRequest("/auth/logout", { method: "POST", schema: emptyResultSchema });
}
