import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { errorMessage } from "@/api/error-message";
import { Alert, Badge, Button, Card, ListRow, ScreenHeader, Sheet, Spinner } from "@/components/ui";
import { Screen } from "@/components/ui/Screen";
import { StallCard } from "@/features/profile/StallCard";
import { useMe } from "@/features/profile/use-me";
import { useMerchantEvents } from "@/features/profile/use-profile";
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
          <StallCard profile={me.data.profile} />
        )}

        <View style={styles.menu}>
          <ListRow
            icon="clock-outline"
            title="Jadwal Operasional"
            description="Atur jam buka dan tutup otomatis"
            onPress={() => router.push("/jadwal")}
          />
          <View style={styles.divider} />
          <ListRow
            icon="wallet-outline"
            title="Metode Pembayaran"
            description="QRIS Pribadi dan tagihan"
            onPress={() => router.push("/pembayaran")}
          />
          <View style={styles.divider} />
          <ListRow
            icon="cash-multiple"
            title="Saldo & Pencairan"
            description="Saldo belum dicairkan dan riwayatnya"
            onPress={() => router.push("/saldo")}
          />
          <View style={styles.divider} />
          <ListRow
            icon="moped-outline"
            title="Pengantaran"
            description="Ongkir dan jangkauan pesanan antar"
            onPress={() => router.push("/pengantaran")}
          />
          <View style={styles.divider} />
          <ListRow
            icon="star-outline"
            title="Rating & Ulasan"
            description="Apa kata Pembeli tentang Lapak kamu"
            onPress={() => router.push("/ulasan")}
          />
        </View>

        <EventsCard />

        {me.data ? (
          <Text style={[type.caption, styles.note]}>
            Masuk sebagai {me.data.profile.ownerName}, {formatPhone(me.data.profile.phone)}
          </Text>
        ) : null}

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

/** Event (Portal EO) yang diikuti Gerai, sama dengan kartu di Profil web. Tidak tampil kalau kosong. */
function EventsCard() {
  const events = useMerchantEvents();
  const list = events.data?.events ?? [];
  if (list.length === 0) return null;
  return (
    <Card style={styles.events}>
      <View style={styles.eventsHead}>
        <MaterialCommunityIcons name="calendar-star" size={22} color={colors.brandStrong} />
        <Text style={type.bodyStrong}>Gerai kamu ikut event</Text>
      </View>
      {list.map((event) => (
        <View key={event.slug} style={styles.eventRow}>
          <View style={styles.flex}>
            <Text style={type.label} numberOfLines={1}>
              {event.name}
            </Text>
            <Text style={type.micro} numberOfLines={1}>
              {event.organizationName}
            </Text>
          </View>
          <Badge
            label={event.isActive ? "Aktif" : "Selesai"}
            tone={event.isActive ? "success" : "neutral"}
            dot
          />
        </View>
      ))}
      <Text style={type.micro}>
        Pesanan dari event ditandai di kartu Pesanan dan diambil Pembeli langsung di Gerai.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  flex: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.line },
  note: { paddingHorizontal: space.xs, textAlign: "center" },
  events: { gap: space.md },
  eventsHead: { flexDirection: "row", alignItems: "center", gap: space.sm },
  eventRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  menu: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
});
