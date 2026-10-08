import { apiRequest } from "../client";
import { metaSchema } from "../schemas/meta";

export function getMeta() {
  return apiRequest("/meta", { schema: metaSchema });
}
