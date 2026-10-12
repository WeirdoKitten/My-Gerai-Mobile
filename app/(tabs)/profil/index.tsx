import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, Card, ListRow, ScreenHeader, Sheet, Spinner } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { useMe } from "@/features/profile/use-me";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatIndonesianPhone } from "@/lib/format/phone";
import { colors, layout, radius, space, type } from "@/theme";

export default function ProfileScreen() {
  const me = useMe();
  const { signOut } = useAuth();
  const [confirmOut, setConfirmOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <Screen header={<ScreenHeader title="Profil" />}>
      <ScrollView contentContainerStyle={styles.content}>
        {me.isPending ? (
          <Spinner size="large" />
        ) : me.error ? (
          <Alert tone="error" message={errorMessage(me.error)} />
        ) : (
          <Card style={styles.card}>
            <Text style={type.title}>{me.data.profile.stallName}</Text>
            <Text style={type.caption}>{me.data.profile.category}</Text>
            <View style={styles.divider} />
            <Row label="Nama Pedagang" value={me.data.profile.ownerName} />
            <Row label="Nomor HP" value={formatPhone(me.data.profile.phone)} />
            {me.data.profile.address ? (
              <Row label="Alamat" value={me.data.profile.address} />
            ) : null}
          </Card>
        )}

        <View style={styles.menu}>
          <ListRow
            icon="clock-outline"
            title="Jadwal Operasional"
            description="Atur jam buka dan tutup otomatis"
            onPress={() => router.push("/jadwal")}
          />
        </View>

        <Text style={[type.caption, styles.note]}>
          Ubah profil dan pengaturan Lapak lainnya lewat dashboard web untuk sementara. Fiturnya
          menyusul di aplikasi.
        </Text>

        <Button
          label="Keluar"
          variant="dangerOutline"
          fullWidth
          onPress={() => setConfirmOut(true)}
        />

        {__DEV__ ? (
          <Button
            label="Lihat komponen UI"
            variant="ghost"
            fullWidth
            onPress={() => router.push("/dev/komponen")}
          />
        ) : null}
      </ScrollView>

      <Sheet
        visible={confirmOut}
        title="Keluar dari MyGerai?"
        description="HP ini tidak akan menerima Pesanan sampai kamu masuk lagi."
        onClose={() => setConfirmOut(false)}
      >
        <Button
          label="Keluar"
          variant="danger"
          size="lg"
          fullWidth
          loading={signingOut}
          onPress={handleSignOut}
        />
        <Button label="Batal" variant="ghost" fullWidth onPress={() => setConfirmOut(false)} />
      </Sheet>
    </Screen>
  );
}

// No. HP profil bisa datang sebagai 08... atau 62...; tampilkan dengan format yang sama.
function formatPhone(phone: string): string {
  return formatIndonesianPhone(phone.replace(/^0/, "62"));
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={type.caption}>{label}</Text>
      <Text style={type.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  card: { gap: space.xs },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: space.md },
  row: { gap: 2, marginBottom: space.sm },
  note: { paddingHorizontal: space.xs },
  menu: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
});
