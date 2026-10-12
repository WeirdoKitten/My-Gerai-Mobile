import { assetUrl } from "@/api/asset-url";
import { operatingHoursInputSchema } from "@/api/schemas/lapak";
import {
  draftsToInput,
  EMPTY_PRODUCT_FORM,
  formToInput,
  productToForm,
} from "@/features/products/product-form";

describe("formToInput", () => {
  it("isian kosong opsional menjadi null, sama dengan form web", () => {
    const parsed = formToInput({ ...EMPTY_PRODUCT_FORM, name: "Bakso Urat", price: "15000" });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({
      name: "Bakso Urat",
      description: undefined,
      price: 15000,
      costPrice: null,
      stock: null,
      photoUrl: null,
      preOrderMinDays: null,
      preOrderMaxDays: null,
    });
  });

  it("pre-order menghapus stok", () => {
    const parsed = formToInput({
      ...EMPTY_PRODUCT_FORM,
      name: "Nasi Tumpeng",
      price: "250000",
      stock: "5",
      isPreOrder: true,
      preOrderMinDays: "2",
      preOrderMaxDays: "30",
    });
    expect(parsed.data).toMatchObject({ stock: null, preOrderMinDays: 2, preOrderMaxDays: 30 });
  });

  it("menolak batas pesan lebih kecil dari waktu pembuatan", () => {
    const parsed = formToInput({
      ...EMPTY_PRODUCT_FORM,
      name: "Nasi Tumpeng",
      price: "250000",
      isPreOrder: true,
      preOrderMinDays: "5",
      preOrderMaxDays: "3",
    });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["preOrderMaxDays"]);
  });

  it("harga wajib diisi", () => {
    expect(formToInput({ ...EMPTY_PRODUCT_FORM, name: "Es Teh" }).success).toBe(false);
  });

  it("bolak-balik dari data server", () => {
    const form = productToForm({
      id: "x",
      name: "Es Teh",
      description: null,
      price: 5000,
      costPrice: 2000,
      stock: 0,
      photoUrl: null,
      status: "available",
      preOrder: null,
    });
    expect(formToInput(form).data).toMatchObject({ price: 5000, costPrice: 2000, stock: 0 });
  });
});

describe("draftsToInput", () => {
  it("selisih kosong menjadi 0 dan minus tetap minus", () => {
    const parsed = draftsToInput([
      {
        key: "g",
        name: "Ukuran",
        options: [
          { key: "a", name: "Kecil", priceDelta: "-2000" },
          { key: "b", name: "Biasa", priceDelta: "" },
        ],
      },
    ]);
    expect(parsed.data).toEqual([
      {
        name: "Ukuran",
        options: [
          { name: "Kecil", priceDelta: -2000 },
          { name: "Biasa", priceDelta: 0 },
        ],
      },
    ]);
  });

  it("grup tanpa nama ditolak", () => {
    const parsed = draftsToInput([
      { key: "g", name: " ", options: [{ key: "a", name: "Pedas", priceDelta: "" }] },
    ]);
    expect(parsed.success).toBe(false);
  });
});

describe("operatingHoursInputSchema", () => {
  it("menerima jadwal lewat tengah malam", () => {
    expect(
      operatingHoursInputSchema.safeParse([{ dayOfWeek: 5, openTime: "18:00", closeTime: "02:00" }])
        .success,
    ).toBe(true);
  });

  it("menolak jam buka sama dengan jam tutup", () => {
    expect(
      operatingHoursInputSchema.safeParse([{ dayOfWeek: 1, openTime: "09:00", closeTime: "09:00" }])
        .success,
    ).toBe(false);
  });
});

describe("assetUrl", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.2.2:3000/api/mobile/v1";
  });

  it("memakai origin server API", () => {
    expect(assetUrl("/uploads/products/a.jpg")).toBe("http://10.0.2.2:3000/uploads/products/a.jpg");
  });

  it("menolak path selain /uploads/", () => {
    expect(assetUrl("/api/mobile/v1/me")).toBeUndefined();
  });
});
