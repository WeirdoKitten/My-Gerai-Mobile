export const orderKeys = {
  all: ["orders"] as const,
  queue: () => [...orderKeys.all, "queue"] as const,
  history: () => [...orderKeys.all, "history"] as const,
};
