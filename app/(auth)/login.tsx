import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

import { login } from "@/api/endpoints/auth";
import { errorMessage } from "@/api/error-message";
import { type LoginInput, loginInputSchema } from "@/api/schemas/auth";
import { Alert, Button, Field, Input, PasswordInput } from "@/components/ui";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { fieldErrors } from "@/features/auth/field-errors";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginScreen() {
  const { signIn, notice, clearNotice, setStatusMessage } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (result) => {
      if (result.status === "approved") {
        await signIn(result.token);
        return;
      }
      setStatusMessage(result.message);
      router.push("/menunggu");
    },
  });

  const edit = (key: keyof LoginInput, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function submit() {
    clearNotice();
    const parsed = loginInputSchema.safeParse({ phone, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <AuthScreen
      title="Masuk ke MyGerai"
      subtitle="Terima dan proses Pesanan Lapak kamu dari HP."
      footer={
        <>
          <Button label="Masuk" size="lg" fullWidth loading={mutation.isPending} onPress={submit} />
          <Button
            label="Belum punya Lapak? Daftar"
            variant="ghost"
            fullWidth
            onPress={() => router.push("/daftar")}
          />
        </>
      }
    >
      {notice ? <Alert tone="warning" message={notice} /> : null}
      <Field label="Nomor HP" error={errors.phone}>
        <Input
          value={phone}
          onChangeText={edit("phone", setPhone)}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          placeholder="081234567890"
          invalid={errors.phone !== undefined}
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <PasswordInput
          value={password}
          onChangeText={edit("password", setPassword)}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          invalid={errors.password !== undefined}
        />
      </Field>
      {mutation.error ? <Alert tone="error" message={errorMessage(mutation.error)} /> : null}
    </AuthScreen>
  );
}
