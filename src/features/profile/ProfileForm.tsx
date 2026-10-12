import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { assetUrl } from "@/api/asset-url";
import { reverseGeocode, uploadStallPhoto } from "@/api/endpoints/profile";
import { errorMessage } from "@/api/error-message";
import {
  type Coordinates,
  type Profile,
  type ProfileInput,
  profileInputSchema,
} from "@/api/schemas/profile";
import { Alert, Button, Field, Input, ScreenHeader, Sheet } from "@/components/ui";
import { fieldErrors } from "@/features/auth/field-errors";
import { formatIndonesianPhone } from "@/lib/format/phone";
import { pickPhoto } from "@/lib/media/photo";
import { colors, layout, radius, space, type } from "@/theme";

import { LocationPicker } from "./LocationPicker";
import { useSaveProfile } from "./use-profile";

type FormValues = {
  stallName: string;
  ownerName: string;
  category: string;
  photoUrl: string | null;
  address: string;
  payoutAccountInfo: string;
  location: Coordinates | null;
};

function profileToForm(profile: Profile): FormValues {
  return {
    stallName: profile.stallName,
    ownerName: profile.ownerName,
    category: profile.category,
    photoUrl: profile.photoUrl,
    address: profile.address ?? "",
    payoutAccountInfo: profile.payoutAccountInfo ?? "",
    location:
      profile.latitude !== null && profile.longitude !== null
        ? { latitude: profile.latitude, longitude: profile.longitude }
        : null,
  };
}

// Sama dengan form web: string kosong dikirim sebagai undefined.
function formToInput(form: FormValues) {
  return profileInputSchema.safeParse({
    stallName: form.stallName,
    ownerName: form.ownerName,
    category: form.category,
    photoUrl: form.photoUrl,
    address: form.address.trim() || undefined,
    payoutAccountInfo: form.payoutAccountInfo.trim() || undefined,
    latitude: form.location?.latitude ?? null,
    longitude: form.location?.longitude ?? null,
  });
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const navigation = useNavigation();
  const [form, setForm] = useState(() => profileToForm(profile));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [leaveAction, setLeaveAction] = useState<(() => void) | null>(null);
  const geocodeRequest = useRef(0);
  const save = useSaveProfile();

  useEffect(() => {
    if (save.isSuccess) router.back();
  }, [save.isSuccess]);

  usePreventRemove(dirty && !save.isSuccess, ({ data }) => {
    setLeaveAction(() => () => navigation.dispatch(data.action));
  });

  const upload = useMutation({
    mutationFn: uploadStallPhoto,
    onSuccess: ({ url }) => setForm((prev) => ({ ...prev, photoUrl: url })),
    onError: (error) => setPhotoError(errorMessage(error)),
  });

  function update(patch: Partial<FormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key as keyof ProfileInput];
      return next;
    });
  }

  /** Pin dipindah → isi alamat otomatis dari peta (tetap bisa diubah). Gagal = diam. */
  async function changeLocation(coords: Coordinates | null) {
    update({ location: coords });
    if (!coords) return;
    const request = ++geocodeRequest.current;
    setGeocoding(true);
    try {
      const { address } = await reverseGeocode(coords);
      if (address && request === geocodeRequest.current) update({ address: address.slice(0, 200) });
    } catch {
      // Alamat tetap bisa diketik sendiri.
    } finally {
      if (request === geocodeRequest.current) setGeocoding(false);
    }
  }

  async function choosePhoto(source: "gallery" | "camera") {
    setPhotoError(null);
    try {
      const result = await pickPhoto(source, [4, 3]);
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
    save.mutate(parsed.data);
  }

  const photoSrc = form.photoUrl ? assetUrl(form.photoUrl) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ScreenHeader title="Ubah Profil" onBack={() => router.back()} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior="height">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View style={styles.section}>
            <View style={styles.cover}>
              {photoSrc ? (
                <Image
                  source={{ uri: photoSrc }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={120}
                  cachePolicy="disk"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={styles.coverEmpty}>
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={40}
                    color={colors.brand}
                  />
                  <Text style={type.caption}>Belum ada foto sampul</Text>
                </View>
              )}
            </View>
            <View style={styles.photoRow}>
              <Button
                label={form.photoUrl ? "Ganti foto" : "Pilih foto"}
                variant="secondary"
                loading={upload.isPending}
                icon={<MaterialCommunityIcons name="image-outline" size={20} color={colors.ink} />}
                onPress={() => choosePhoto("gallery")}
              />
              <Button
                label="Ambil foto"
                variant="ghost"
                disabled={upload.isPending}
                onPress={() => choosePhoto("camera")}
              />
              {form.photoUrl ? (
                <Button label="Hapus" variant="ghost" onPress={() => update({ photoUrl: null })} />
              ) : null}
            </View>
            <Text style={type.micro}>
              Tampil di kartu Gerai yang dilihat Pembeli. Tanpa foto, yang tampil ikon toko polos.
            </Text>
            {photoError ? <Alert tone="error" message={photoError} /> : null}
          </View>

          <View style={styles.section}>
            <Text style={type.heading}>Info Lapak</Text>
            <Field label="Nama Lapak" error={errors.stallName}>
              <Input
                value={form.stallName}
                onChangeText={(stallName) => update({ stallName })}
                maxLength={100}
                invalid={errors.stallName !== undefined}
              />
            </Field>
            <Field label="Nama Pemilik" error={errors.ownerName}>
              <Input
                value={form.ownerName}
                onChangeText={(ownerName) => update({ ownerName })}
                maxLength={100}
                invalid={errors.ownerName !== undefined}
              />
            </Field>
            <Field
              label="Kategori"
              hint="Contoh: Makanan, Minuman, Pakaian"
              error={errors.category}
            >
              <Input
                value={form.category}
                onChangeText={(category) => update({ category })}
                maxLength={50}
                invalid={errors.category !== undefined}
              />
            </Field>
          </View>

          <View style={styles.section}>
            <Text style={type.heading}>Lokasi Lapak</Text>
            <Text style={type.caption}>
              Dipakai untuk jangkauan pesanan antar dan pengelompokan area. Opsional.
            </Text>
            <LocationPicker
              value={form.location}
              onChange={changeLocation}
              onMapTouch={(active) => setScrollEnabled(!active)}
            />
            <Field
              label="Alamat Lapak"
              hint={
                geocoding
                  ? "Mengambil nama alamat dari peta..."
                  : "Terisi otomatis dari pin. Boleh diubah, misalnya untuk menambah patokan."
              }
              error={errors.address}
            >
              <Input
                value={form.address}
                onChangeText={(address) => update({ address })}
                multiline
                maxLength={200}
                placeholder="Contoh: Jl. Merdeka No. 5, dekat Alfamart"
                invalid={errors.address !== undefined}
              />
            </Field>
          </View>

          <View style={styles.section}>
            <Text style={type.heading}>Rekening Pencairan</Text>
            <Field
              label="Info rekening atau e-wallet"
              hint="Ke mana Admin mengirim uang saat Pencairan. Hanya kamu dan Admin yang melihatnya."
              error={errors.payoutAccountInfo}
            >
              <Input
                value={form.payoutAccountInfo}
                onChangeText={(payoutAccountInfo) => update({ payoutAccountInfo })}
                multiline
                maxLength={300}
                autoCorrect={false}
                // Nomor rekening tidak boleh dipelajari keyboard atau disimpan layanan isi otomatis.
                autoComplete="off"
                importantForAutofill="no"
                placeholder="Contoh: BCA 1234567890 a.n. Budi, atau GoPay 0812xxxxxxx"
                invalid={errors.payoutAccountInfo !== undefined}
              />
            </Field>
          </View>

          <View style={styles.section}>
            <Text style={type.heading}>Akun</Text>
            <Field label="Nomor HP untuk masuk" hint="Belum bisa diubah dari sini.">
              <Input
                value={formatIndonesianPhone(profile.phone.replace(/^0/, "62"))}
                editable={false}
                style={styles.readOnly}
              />
            </Field>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {formError || save.error ? (
            <Alert tone="error" message={formError ?? errorMessage(save.error)} />
          ) : null}
          <Button
            label="Simpan Profil"
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
        description="Perubahan profil belum disimpan dan akan hilang."
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
    gap: space.xxl + space.sm,
  },
  section: { gap: space.md },
  cover: {
    height: 200,
    width: "100%",
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.brandTint,
  },
  coverEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  readOnly: { backgroundColor: colors.neutralBg, color: colors.inkMuted },
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
