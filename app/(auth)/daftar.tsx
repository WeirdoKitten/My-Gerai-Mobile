import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { register } from "@/api/endpoints/auth";
import { errorMessage } from "@/api/error-message";
import { type RegisterInput, registerInputSchema } from "@/api/schemas/auth";
import { Alert, Button, Field, Input, PasswordInput } from "@/components/ui";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { fieldErrors } from "@/features/auth/field-errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { colors, radius, space, touch } from "@/theme";

const EMPTY: RegisterInput = {
  stallName: "",
  ownerName: "",
  category: "",
  phone: "",
  password: "",
};

export default function RegisterScreen() {
  const { setStatusMessage } = useAuth();
  const [form, setForm] = useState<RegisterInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (result) => {
      setStatusMessage(result.message);
      router.replace("/menunggu");
    },
  });

  const set = (key: keyof RegisterInput) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function submit() {
    const parsed = registerInputSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <AuthScreen
      title="Daftarkan Lapak"
      subtitle="Lapak bisa dipakai setelah disetujui Admin MyGerai."
      onBackPress={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => router.back()}
          style={styles.back}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.ink} />
        </Pressable>
      }
      footer={
        <Button label="Daftar" size="lg" fullWidth loading={mutation.isPending} onPress={submit} />
      }
    >
      <Field label="Nama Lapak" error={errors.stallName}>
        <Input
          value={form.stallName}
          onChangeText={set("stallName")}
          maxLength={100}
          placeholder="Mis. Bakso Pak Budi"
          invalid={errors.stallName !== undefined}
        />
      </Field>
      <Field label="Nama Pedagang" error={errors.ownerName}>
        <Input
          value={form.ownerName}
          onChangeText={set("ownerName")}
          maxLength={100}
          autoComplete="name"
          invalid={errors.ownerName !== undefined}
        />
      </Field>
      <Field label="Kategori" hint="Contoh: Makanan, Minuman, Pakaian" error={errors.category}>
        <Input
          value={form.category}
          onChangeText={set("category")}
          maxLength={50}
          invalid={errors.category !== undefined}
        />
      </Field>
      <Field label="Nomor HP" hint="Dipakai untuk masuk." error={errors.phone}>
        <Input
          value={form.phone}
          onChangeText={set("phone")}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="081234567890"
          invalid={errors.phone !== undefined}
        />
      </Field>
      <Field label="Password" hint="Minimal 8 karakter." error={errors.password}>
        <PasswordInput
          value={form.password}
          onChangeText={set("password")}
          autoComplete="new-password"
          invalid={errors.password !== undefined}
        />
      </Field>
      {mutation.error ? <Alert tone="error" message={errorMessage(mutation.error)} /> : null}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: touch.min,
    height: touch.min,
    marginLeft: -space.md,
    marginTop: -space.xxl,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
