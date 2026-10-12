import {
  minutesUntilDeliveryFailAllowed,
  needsAttention,
  nextMerchantStatus,
} from "@/features/orders/order-status";

describe("nextMerchantStatus", () => {
  it("mengikuti urutan Ambil Sendiri", () => {
    expect(nextMerchantStatus("dibayar", "ambil_sendiri")).toBe("diproses");
    expect(nextMerchantStatus("diproses", "ambil_sendiri")).toBe("siap_diambil");
    expect(nextMerchantStatus("siap_diambil", "ambil_sendiri")).toBe("selesai");
  });

  it("mengikuti urutan Pesanan Antar", () => {
    expect(nextMerchantStatus("diproses", "antar")).toBe("sedang_diantar");
    expect(nextMerchantStatus("sedang_diantar", "antar")).toBe("selesai");
  });

  it("tidak ada tombol untuk status lain", () => {
    expect(nextMerchantStatus("menunggu_pembayaran", "ambil_sendiri")).toBeNull();
    expect(nextMerchantStatus("selesai", "antar")).toBeNull();
    expect(nextMerchantStatus("siap_diambil", "antar")).toBeNull();
  });
});

describe("minutesUntilDeliveryFailAllowed", () => {
  const start = "2026-10-12T05:00:00.000Z";

  it("menghitung sisa menit dari mulai antar", () => {
    expect(minutesUntilDeliveryFailAllowed(start, new Date("2026-10-12T05:05:00.000Z"))).toBe(10);
  });

  it("nol setelah 15 menit", () => {
    expect(minutesUntilDeliveryFailAllowed(start, new Date("2026-10-12T05:20:00.000Z"))).toBe(0);
  });

  it("penuh kalau belum mulai antar", () => {
    expect(minutesUntilDeliveryFailAllowed(null)).toBe(15);
  });
});

describe("needsAttention", () => {
  it("Pesanan baru lunas atau QRIS Pribadi yang menunggu konfirmasi", () => {
    expect(needsAttention({ status: "dibayar", awaitingManualConfirmation: false })).toBe(true);
    expect(
      needsAttention({ status: "menunggu_pembayaran", awaitingManualConfirmation: true }),
    ).toBe(true);
    expect(needsAttention({ status: "diproses", awaitingManualConfirmation: false })).toBe(false);
  });
});
