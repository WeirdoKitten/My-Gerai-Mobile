import { apiRequest } from "../client";
import { meSchema } from "../schemas/me";

export function getMe() {
  return apiRequest("/me", { schema: meSchema });
}
