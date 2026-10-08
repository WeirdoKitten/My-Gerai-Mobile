import { formatRupiah } from "@/lib/format/money";

describe("formatRupiah", () => {
  it.each([
    [0, "Rp0"],
    [500, "Rp500"],
    [12_000, "Rp12.000"],
    [1_250_000, "Rp1.250.000"],
    [-5_000, "-Rp5.000"],
  ])("%d → %s", (amount, expected) => {
    expect(formatRupiah(amount)).toBe(expected);
  });
});
