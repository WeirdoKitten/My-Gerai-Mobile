import { orderIdFromNotification } from "@/lib/notifications/push";

jest.mock("expo-notifications", () => ({}));
jest.mock("expo-constants", () => ({ expoConfig: {} }));

describe("orderIdFromNotification", () => {
  const id = "71095f63-1845-4ae3-9549-7a0b31ba0681";

  it("menerima push order_paid dengan UUID", () => {
    expect(orderIdFromNotification({ type: "order_paid", orderId: id })).toBe(id);
  });

  it("menolak data yang bukan push Pesanan lunas", () => {
    expect(orderIdFromNotification(null)).toBeNull();
    expect(orderIdFromNotification({ type: "lain", orderId: id })).toBeNull();
    expect(orderIdFromNotification({ type: "order_paid", orderId: "../profil" })).toBeNull();
    expect(orderIdFromNotification({ type: "order_paid", orderId: 123 })).toBeNull();
  });
});
