import { apiRequest } from "../client";
import { emptyResultSchema } from "../schemas/auth";
import { type OperatingHoursRow, openStatusSchema } from "../schemas/lapak";

export function getOpenStatus() {
  return apiRequest("/open-status", { schema: openStatusSchema });
}

export function setOpenState(state: "open" | "closed") {
  return apiRequest("/open-status", {
    method: "POST",
    body: { state },
    schema: emptyResultSchema,
  });
}

export function setOperatingHours(hours: OperatingHoursRow[]) {
  return apiRequest("/operating-hours", {
    method: "PUT",
    body: { hours },
    schema: emptyResultSchema,
  });
}
