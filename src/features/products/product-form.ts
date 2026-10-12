import {
  type Product,
  type ProductInput,
  productInputSchema,
  type VariantGroup,
  type VariantGroupsInput,
  variantGroupsInputSchema,
} from "@/api/schemas/products";

/** Isian form selalu string (TextInput); diubah ke payload API saat disimpan. */
export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  stock: string;
  isPreOrder: boolean;
  preOrderMinDays: string;
  preOrderMaxDays: string;
  photoUrl: string | null;
};

export type VariantOptionDraft = { key: string; name: string; priceDelta: string };
export type VariantGroupDraft = { key: string; name: string; options: VariantOptionDraft[] };

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  stock: "",
  isPreOrder: false,
  preOrderMinDays: "1",
  preOrderMaxDays: "14",
  photoUrl: null,
};

export function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    costPrice: product.costPrice === null ? "" : String(product.costPrice),
    stock: product.stock === null ? "" : String(product.stock),
    isPreOrder: product.preOrder !== null,
    preOrderMinDays: String(product.preOrder?.minDays ?? 1),
    preOrderMaxDays: String(product.preOrder?.maxDays ?? 14),
    photoUrl: product.photoUrl,
  };
}

const toNumberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

/** Sama dengan handleSubmit ProductForm web: kosong = null, pre-order menghapus stok. */
export function formToInput(form: ProductFormValues) {
  return productInputSchema.safeParse({
    name: form.name,
    description: form.description.trim() || undefined,
    price: form.price.trim() === "" ? Number.NaN : Number(form.price),
    costPrice: toNumberOrNull(form.costPrice),
    stock: form.isPreOrder ? null : toNumberOrNull(form.stock),
    photoUrl: form.photoUrl,
    preOrderMinDays: form.isPreOrder ? toNumberOrNull(form.preOrderMinDays) : null,
    preOrderMaxDays: form.isPreOrder ? toNumberOrNull(form.preOrderMaxDays) : null,
  } satisfies Record<keyof ProductInput, unknown>);
}

let draftCounter = 0;
export const newDraftKey = () => `draft-${++draftCounter}`;

export function groupsToDrafts(groups: VariantGroup[]): VariantGroupDraft[] {
  return groups.map((group) => ({
    key: group.id,
    name: group.name,
    options: group.options.map((option) => ({
      key: option.id,
      name: option.name,
      priceDelta: option.priceDelta === 0 ? "" : String(option.priceDelta),
    })),
  }));
}

export function draftsToInput(drafts: VariantGroupDraft[]) {
  const groups: VariantGroupsInput = drafts.map((group) => ({
    name: group.name,
    options: group.options.map((option) => ({
      name: option.name,
      priceDelta: option.priceDelta.trim() === "" ? 0 : Number(option.priceDelta),
    })),
  }));
  return variantGroupsInputSchema.safeParse(groups);
}
