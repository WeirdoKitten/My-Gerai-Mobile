import { receiptSchema } from "@/api/schemas/orders";
import {
  buildReceiptLines,
  encodeEscPos,
  formatReceiptDateTime,
  RECEIPT_WIDTH,
} from "@/lib/receipt/escpos";

import golden from "./fixtures/receipt-golden.json";

// Fixture dibuat dari kode web asli (src/lib/utils/receipt.ts). Struk aplikasi wajib identik.
// Ubah format di web → buat ulang fixture (lihat CHANGELOG 2026-10-13) → ubah port ini.
describe("struk identik dengan web", () => {
  it.each(golden.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
    const receipt = receiptSchema.parse(c.receipt);
    const lines = buildReceiptLines(receipt);
    expect(lines).toEqual(c.lines);
    const expected = Array.from(atob(c.bytes), (char) => char.charCodeAt(0));
    expect(Array.from(encodeEscPos(lines))).toEqual(expected);
  });

  it("tidak ada baris melebihi lebar kertas 58mm", () => {
    for (const c of golden.cases) {
      for (const line of buildReceiptLines(receiptSchema.parse(c.receipt))) {
        expect(line.text.length).toBeLessThanOrEqual(RECEIPT_WIDTH);
      }
    }
  });
});

describe("formatReceiptDateTime", () => {
  it("WIB, dd/mm/yyyy HH:mm, termasuk lewat tengah malam", () => {
    expect(formatReceiptDateTime("2026-09-25T07:32:00.000Z")).toBe("25/09/2026 14:32");
    expect(formatReceiptDateTime("2026-12-31T17:05:00.000Z")).toBe("01/01/2027 00:05");
  });
});
