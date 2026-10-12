import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { type DeliverySettings, deliveryInputSchema } from "@/api/schemas/profile";
import {
  Alert,
  Button,
  Field,
  Input,
  MoneyInput,
  Spinner,
  SubScreen,
  Toggle,
} from "@/components/ui";
import { fieldErrors } from "@/features/auth/field-errors";
import { useDeliverySettings, useSaveDeliverySettings } from "@/features/profile/use-profile";
import { formatRupiah } from "@/lib/format/money";
import { colors, layout, radius, space, type } from "@/theme";

export default function DeliveryScreen() {
  const settings = useDeliverySettings();

  if (settings.data) {
    return <DeliveryForm key={settings.dataUpdatedAt} settings={settings.data} />;
  }
  return (
    <SubScreen title="Pengantaran">
      {settings.error ? (
        <View style={styles.content}>
          <Alert tone="error" message={errorMessage(settings.error)} />
          <Button label="Coba lagi" variant="secondary" onPress={() => settings.refetch()} />
        </View>
      ) : (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      )}
    </SubScreen>
  );
}

type Errors = Partial<Record<"deliveryFee" | "deliveryRadiusKm", string>>;

function DeliveryForm({ settings }: { settings: DeliverySettings }) {
  const [enabled, setEnabled] = useState(settings.deliveryEnabled);
  const [fee, setFee] = useState(settings.deliveryFee === null ? "" : String(settings.deliveryFee));
  // Tampilkan desimal gaya Indonesia (2,5); dikirim sebagai angka.
  const [radiusKm, setRadiusKm] = useState(String(settings.deliveryRadiusKm).replace(".", ","));
  const [errors, setErrors] = useState<Errors>({});
  const save = useSaveDeliverySettings();

  function submit() {
    const parsed = deliveryInputSchema.safeParse({
      deliveryEnabled: enabled,
      deliveryFee: fee === "" ? null : Number(fee),
      deliveryRadiusKm: radiusKm.trim() === "" ? undefined : Number(radiusKm.replace(",", ".")),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    save.mutate(parsed.data);
  }

  return (
    <SubScreen
      title="Pengantaran"
      footer={
        <>
          {save.error ? <Alert tone="error" message={errorMessage(save.error)} /> : null}
          <Button label="Simpan" size="lg" fullWidth loading={save.isPending} onPress={submit} />
        </>
      }
    >
      <KeyboardAvoidingView style={styles.flex} behavior="height">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={type.caption}>
            Terima pesanan yang kamu antar sendiri ke alamat Pembeli. Ongkir masuk penuh ke kamu.
            Pesanan ambil sendiri tetap berjalan seperti biasa.
          </Text>

          {settings.hasLocation ? null : (
            <View style={styles.gap}>
              <Alert
                tone="warning"
                message="Pasang titik lokasi Lapak dulu di Ubah Profil, karena jangkauan antar dihitung dari titik itu."
              />
              <Button
                label="Pasang titik di Ubah Profil"
                variant="secondary"
                icon={
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.ink} />
                }
                onPress={() => router.push("/ubah-profil")}
              />
            </View>
          )}

          <View style={[styles.switchPanel, enabled && styles.switchPanelOn]}>
            <MaterialCommunityIcons
              name="moped-outline"
              size={28}
              color={enabled ? colors.brandStrong : colors.inkMuted}
            />
            <View style={styles.flex}>
              <Text style={type.bodyStrong}>Terima pesanan antar</Text>
              <Text style={type.caption}>
                Bisa dimatikan kapan saja, contohnya saat sedang ramai atau sedang mengantar.
              </Text>
            </View>
            <Toggle
              value={enabled}
              onValueChange={setEnabled}
              disabled={!settings.hasLocation}
              label="Terima pesanan antar"
            />
          </View>

          <Field
            label="Ongkir (Rp)"
            hint={
              fee
                ? `${formatRupiah(Number(fee))} per pesanan antar`
                : "Tarif tetap per pesanan antar."
            }
            error={errors.deliveryFee}
          >
            <MoneyInput
              value={fee}
              onChangeText={(value) => {
                setFee(value);
                setErrors((prev) => ({ ...prev, deliveryFee: undefined }));
              }}
              maxLength={6}
              placeholder="5000"
              invalid={errors.deliveryFee !== undefined}
            />
          </Field>
          <Field
            label="Jangkauan maksimal (km)"
            hint="Jarak garis lurus dari titik Lapak ke titik Pembeli. 0,5 sampai 20 km."
            error={errors.deliveryRadiusKm}
          >
            <Input
              value={radiusKm}
              onChangeText={(value) => {
                setRadiusKm(value.replace(/[^\d,.]/g, ""));
                setErrors((prev) => ({ ...prev, deliveryRadiusKm: undefined }));
              }}
              keyboardType="decimal-pad"
              maxLength={4}
              invalid={errors.deliveryRadiusKm !== undefined}
            />
          </Field>
        </ScrollView>
      </KeyboardAvoidingView>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gap: { gap: space.sm },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  switchPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  switchPanelOn: { borderColor: colors.brand, backgroundColor: colors.brandTint },
});
