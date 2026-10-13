export const orderKeys = {
  all: ["orders"] as const,
  queue: () => [...orderKeys.all, "queue"] as const,
  history: () => [...orderKeys.all, "history"] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
};
