import { orderQueueSchema } from "@/api/schemas/orders";

// Bentuk respons nyata GET /orders dari server dev (2026-10-12), disederhanakan.
const response = {
  orders: [
    {
      id: "6f1c1f0e-0000-4000-8000-000000000001",
      orderCode: "CGVR8QK2",
      status: "dibayar",
      buyerName: "Rina",
      buyerNote: null,
      createdAt: "2026-10-12T05:44:00.000Z",
      items: [
        {
          id: "a",
          productNameSnapshot: "Bakso Halus",
          priceSnapshot: 12000,
          qty: 1,
          note: "Tanpa seledri",
          variantSelections: [],
        },
      ],
      fulfillmentMethod: "ambil_sendiri",
      deliveryFeeSnapshot: 0,
      delivery: null,
      scheduledFor: null,
      buyerPhone: null,
      eventName: null,
      awaitingManualConfirmation: false,
      fieldBaruDariServer: "diabaikan",
    },
  ],
  totalActive: 1,
};

describe("orderQueueSchema", () => {
  it("menerima respons server dan membuang field yang tidak dikenal", () => {
    const parsed = orderQueueSchema.parse(response);
    expect(parsed.orders[0]?.orderCode).toBe("CGVR8QK2");
    expect(parsed.orders[0]).not.toHaveProperty("fieldBaruDariServer");
  });

  it("menolak status yang tidak dikenal", () => {
    const broken = { ...response, orders: [{ ...response.orders[0], status: "hilang" }] };
    expect(orderQueueSchema.safeParse(broken).success).toBe(false);
  });
});
