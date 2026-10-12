import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Me } from "@/api/schemas/me";
import { Button, PhotoThumb } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

const STRIPE = 24;

/**
 * Kartu identitas Lapak di tab Profil. Tenda bergaris di atas kartu mengingatkan pada
 * gerobak/tenda Lapak; satu-satunya hiasan di layar ini.
 */
export function StallCard({ profile }: { profile: Me["profile"] }) {
  return (
    <View style={styles.root}>
      <Awning />
      <View style={styles.body}>
        <View style={styles.identity}>
          <PhotoThumb src={profile.photoUrl} size={72} />
          <View style={styles.text}>
            <Text style={type.title} numberOfLines={2}>
              {profile.stallName}
            </Text>
            <Text style={type.caption}>{profile.category}</Text>
          </View>
        </View>
        {profile.address ? (
          <View style={styles.address}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.inkMuted} />
            <Text style={[type.caption, styles.text]} numberOfLines={2}>
              {profile.address}
            </Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              label="Ubah Profil"
              variant="secondary"
              fullWidth
              icon={<MaterialCommunityIcons name="pencil-outline" size={20} color={colors.ink} />}
              onPress={() => router.push("/ubah-profil")}
            />
          </View>
          <View style={styles.action}>
            <Button
              label="QR Menu"
              variant="secondary"
              fullWidth
              icon={<MaterialCommunityIcons name="qrcode" size={20} color={colors.ink} />}
              onPress={() => router.push("/qr-menu")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Garis tenda brand/brandTint dengan tepi bergelombang. Jumlah garis mengikuti lebar kartu. */
function Awning() {
  const [count, setCount] = useState(0);
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setCount(Math.max(1, Math.round(e.nativeEvent.layout.width / STRIPE)))}
    >
      <View style={styles.stripes}>
        {items.map((i) => (
          <View key={i} style={[styles.stripe, i % 2 === 1 && styles.stripeLight]} />
        ))}
      </View>
      <View style={styles.scallops}>
        {items.map((i) => (
          <View key={i} style={styles.scallopCell}>
            <View style={[styles.scallop, i % 2 === 1 && styles.stripeLight]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const SCALLOP = STRIPE / 2;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  stripes: { flexDirection: "row", height: 14 },
  stripe: { flex: 1, backgroundColor: colors.brand },
  stripeLight: { backgroundColor: colors.brandTint },
  scallops: { flexDirection: "row", height: SCALLOP, overflow: "hidden" },
  scallopCell: { flex: 1, alignItems: "center" },
  scallop: {
    width: "100%",
    aspectRatio: 1,
    marginTop: -SCALLOP,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  body: { padding: space.lg, paddingTop: space.md, gap: space.md },
  identity: { flexDirection: "row", alignItems: "center", gap: space.lg },
  text: { flex: 1 },
  address: { flexDirection: "row", alignItems: "flex-start", gap: space.xs },
  actions: { flexDirection: "row", gap: space.sm },
  action: { flex: 1 },
});
