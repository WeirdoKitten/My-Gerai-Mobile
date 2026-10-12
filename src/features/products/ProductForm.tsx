import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { uploadProductPhoto } from "@/api/endpoints/products";
import { errorMessage } from "@/api/error-message";
import type { Product, ProductInput, VariantGroup } from "@/api/schemas/products";
import {
  Alert,
  Button,
  Field,
  Input,
  MoneyInput,
  PhotoThumb,
  ScreenHeader,
  Sheet,
  Toggle,
} from "@/components/ui";
import { fieldErrors } from "@/features/auth/field-errors";
import { formatRupiah } from "@/lib/format/money";
import { colors, layout, radius, space, type } from "@/theme";

import { pickPhoto } from "./photo";
import {
  draftsToInput,
  EMPTY_PRODUCT_FORM,
  formToInput,
  groupsToDrafts,
  type ProductFormValues,
  productToForm,
  type VariantGroupDraft,
} from "./product-form";
import { useSaveProduct } from "./use-products";
import { VariantEditor } from "./VariantEditor";

type ProductFormProps = {
  product: Product | null;
  initialGroups: VariantGroup[];
};

export function ProductForm({ product, initialGroups }: ProductFormProps) {
  const navigation = useNavigation();
  const [form, setForm] = useState<ProductFormValues>(() =>
    product ? productToForm(product) : EMPTY_PRODUCT_FORM,
  );
  const [groups, setGroups] = useState<VariantGroupDraft[]>(() => groupsToDrafts(initialGroups));
  const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const save = useSaveProduct();
  const [dirty, setDirty] = useState(false);
  const [leaveAction, setLeaveAction] = useState<(() => void) | null>(null);

  // Isian belum disimpan: tombol Back/kembali minta konfirmasi dulu, supaya tidak hilang karena salah tekan.
  // Kembali setelah tersimpan lewat effect, supaya penjagaan di bawah sudah nonaktif.
  useEffect(() => {
    if (save.isSuccess) router.back();
  }, [save.isSuccess]);

  usePreventRemove(dirty && !save.isSuccess, ({ data }) => {
    setLeaveAction(() => () => navigation.dispatch(data.action));
  });

  const upload = useMutation({
    mutationFn: uploadProductPhoto,
    onSuccess: ({ url }) => setForm((prev) => ({ ...prev, photoUrl: url })),
    onError: (error) => setPhotoError(errorMessage(error)),
  });

  const set =
    <K extends keyof ProductFormValues>(key: K) =>
    (value: ProductFormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
      setDirty(true);
    };

  async function choosePhoto(source: "gallery" | "camera") {
    setPhotoError(null);
    try {
      const result = await pickPhoto(source);
      if (result.kind === "denied") setPhotoError(result.message);
      if (result.kind === "picked") {
        upload.mutate(result.uri);
        setDirty(true);
      }
    } catch {
      setPhotoError("Gagal memproses foto. Coba foto lain.");
    }
  }

  function submit() {
    setFormError(null);
    const parsed = formToInput(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError("Periksa lagi isian yang ditandai merah.");
      return;
    }
    const variants = draftsToInput(groups);
    if (!variants.success) {
      setFormError(variants.error.issues[0]?.message ?? "Periksa lagi isian varian.");
      return;
    }
    save.mutate({ productId: product?.id ?? null, input: parsed.data, groups: variants.data });
  }

  const pricePreview = form.price ? formatRupiah(Number(form.price)) : undefined;
  const costPreview = form.costPrice ? formatRupiah(Number(form.costPrice)) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ScreenHeader title={product ? "Ubah Item" : "Tambah Item"} onBack={() => router.back()} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior="height">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.photo}>
            <PhotoThumb src={form.photoUrl} size={96} />
            <View style={styles.photoActions}>
              <Button
                label={form.photoUrl ? "Ganti dari galeri" : "Pilih dari galeri"}
                variant="secondary"
                fullWidth
                loading={upload.isPending}
                icon={<MaterialCommunityIcons name="image-outline" size={20} color={colors.ink} />}
                onPress={() => choosePhoto("gallery")}
              />
              <View style={styles.photoRow}>
                <Button
                  label="Ambil foto"
                  variant="ghost"
                  disabled={upload.isPending}
                  onPress={() => choosePhoto("camera")}
                />
                {form.photoUrl ? (
                  <Button
                    label="Hapus foto"
                    variant="ghost"
                    onPress={() => set("photoUrl")(null)}
                  />
                ) : null}
              </View>
            </View>
          </View>
          {photoError ? <Alert tone="error" message={photoError} /> : null}

          <Field label="Nama Item" error={errors.name}>
            <Input
              value={form.name}
              onChangeText={set("name")}
              maxLength={100}
              placeholder="Mis. Bakso Urat"
              invalid={errors.name !== undefined}
            />
          </Field>
          <Field label="Deskripsi" hint="Opsional." error={errors.description}>
            <Input
              value={form.description}
              onChangeText={set("description")}
              multiline
              maxLength={500}
              placeholder="Isi atau porsi Item ini"
            />
          </Field>
          <Field label="Harga Jual (Rp)" hint={pricePreview} error={errors.price}>
            <MoneyInput
              value={form.price}
              onChangeText={set("price")}
              placeholder="15000"
              invalid={errors.price !== undefined}
            />
          </Field>
          <Field
            label="Harga Modal (Rp)"
            hint={costPreview ?? "Opsional. Dipakai untuk hitung keuntungan di Laporan Penjualan."}
            error={errors.costPrice}
          >
            <MoneyInput
              value={form.costPrice}
              onChangeText={set("costPrice")}
              placeholder="Belum diisi"
              invalid={errors.costPrice !== undefined}
            />
          </Field>

          <View style={styles.preOrder}>
            <View style={styles.preOrderHead}>
              <View style={styles.flex}>
                <Text style={type.bodyStrong}>Pre-order</Text>
                <Text style={type.caption}>
                  Untuk Item yang dibuat sesuai pesanan, misalnya nasi tumpeng. Pembeli memilih
                  tanggal dan jam ambil, dan tetap bisa memesan saat Lapak tutup.
                </Text>
              </View>
              <Toggle value={form.isPreOrder} onValueChange={set("isPreOrder")} label="Pre-order" />
            </View>
            {form.isPreOrder ? (
              <View style={styles.preOrderFields}>
                <Field
                  label="Waktu pembuatan (hari)"
                  hint="Pesanan paling cepat diambil H+ sekian."
                  error={errors.preOrderMinDays}
                >
                  <Input
                    value={form.preOrderMinDays}
                    onChangeText={(v) => set("preOrderMinDays")(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={2}
                    invalid={errors.preOrderMinDays !== undefined}
                  />
                </Field>
                <Field
                  label="Bisa dipesan maks. (hari)"
                  hint="Sejauh apa ke depan Pembeli boleh memesan."
                  error={errors.preOrderMaxDays}
                >
                  <Input
                    value={form.preOrderMaxDays}
                    onChangeText={(v) => set("preOrderMaxDays")(v.replace(/\D/g, ""))}
                    keyboardType="number-pad"
                    maxLength={2}
                    invalid={errors.preOrderMaxDays !== undefined}
                  />
                </Field>
              </View>
            ) : null}
          </View>

          {form.isPreOrder ? null : (
            <Field label="Stok" hint="Kosongkan kalau tidak dibatasi." error={errors.stock}>
              <Input
                value={form.stock}
                onChangeText={(v) => set("stock")(v.replace(/\D/g, ""))}
                keyboardType="number-pad"
                maxLength={7}
                placeholder="Tidak dibatasi"
                invalid={errors.stock !== undefined}
              />
            </Field>
          )}

          <View style={styles.section}>
            <Text style={type.label}>Varian (opsional)</Text>
            <Text style={type.caption}>
              Contohnya Level Pedas, Ukuran, atau Warna. Stok tetap satu untuk seluruh Item, tidak
              dipisah per pilihan.
            </Text>
            <VariantEditor
              groups={groups}
              onChange={(next) => {
                setGroups(next);
                setDirty(true);
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {formError || save.error ? (
            <Alert tone="error" message={formError ?? errorMessage(save.error)} />
          ) : null}
          <Button
            label="Simpan Item"
            size="lg"
            fullWidth
            loading={save.isPending}
            disabled={upload.isPending}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>

      <Sheet
        visible={leaveAction !== null}
        title="Buang perubahan?"
        description="Isian Item ini belum disimpan dan akan hilang."
        onClose={() => setLeaveAction(null)}
      >
        <Button
          label="Buang perubahan"
          variant="danger"
          size="lg"
          fullWidth
          onPress={() => {
            const leave = leaveAction;
            setLeaveAction(null);
            leave?.();
          }}
        />
        <Button
          label="Lanjut mengisi"
          variant="ghost"
          fullWidth
          onPress={() => setLeaveAction(null)}
        />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  photo: { flexDirection: "row", alignItems: "center", gap: space.lg },
  photoActions: { flex: 1, gap: space.xs },
  photoRow: { flexDirection: "row", flexWrap: "wrap" },
  preOrder: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  preOrderHead: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  preOrderFields: { gap: space.lg },
  section: { gap: space.sm },
  footer: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
