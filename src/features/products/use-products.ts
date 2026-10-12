import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProduct,
  getProducts,
  getVariantGroups,
  saveVariantGroups,
  setProductStatus,
  updateProduct,
} from "@/api/endpoints/products";
import type { Product, ProductInput, VariantGroupsInput } from "@/api/schemas/products";
import { useToast } from "@/components/ui";

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  variants: (productId: string) => [...productKeys.all, "variants", productId] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: getProducts });
}

export function useProduct(productId: string): Product | undefined {
  return useProducts().data?.products.find((p) => p.id === productId);
}

export function useVariantGroups(productId: string | null) {
  return useQuery({
    queryKey: productKeys.variants(productId ?? "baru"),
    queryFn: () => getVariantGroups(productId as string),
    enabled: productId !== null,
  });
}

/** Simpan Item lalu varian-nya, sama dengan form web (varian selalu ditulis ulang). */
export function useSaveProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({
      productId,
      input,
      groups,
    }: {
      productId: string | null;
      input: ProductInput;
      groups: VariantGroupsInput;
    }) => {
      let id = productId;
      if (id === null) {
        id = (await createProduct(input)).productId;
      } else {
        await updateProduct(id, input);
      }
      await saveVariantGroups(id, groups);
      return id;
    },
    onSuccess: (_id, { input }) => {
      showToast(`${input.name.trim()} disimpan`);
      return queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useSetProductStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ product, available }: { product: Product; available: boolean }) =>
      setProductStatus(product.id, available ? "available" : "sold_out"),
    // Optimistik: toggle langsung berubah, dikembalikan kalau server menolak.
    onMutate: async ({ product, available }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.list() });
      const previous = queryClient.getQueryData<{ products: Product[] }>(productKeys.list());
      queryClient.setQueryData<{ products: Product[] }>(productKeys.list(), (data) =>
        data
          ? {
              products: data.products.map((p) =>
                p.id === product.id ? { ...p, status: available ? "available" : "sold_out" } : p,
              ),
            }
          : data,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(productKeys.list(), context.previous);
    },
    onSuccess: (_data, { product, available }) => {
      showToast(`${product.name} ditandai ${available ? "Tersedia" : "Habis"}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.list() }),
  });
}
