import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { captureRef } from "react-native-view-shot";

import { errorMessage } from "@/api/error-message";
import { Alert, Button, Spinner, SubScreen, useToast } from "@/components/ui";
import { useQrMenu } from "@/features/profile/use-profile";
import { imageToFile, type SaveResult, saveToGallery, shareImage } from "@/lib/media/save-image";
import { adaptPosterSvg, decodeSvgDataUri } from "@/lib/media/svg-data-uri";
import { colors, layout, radius, space, touch, type } from "@/theme";

// Ukuran poster dari server (QR_POSTER_SIZE web) dan ukuran ekspor PNG (3x, tetap tajam saat dicetak).
const POSTER = { width: 520, height: 612 };
const EXPORT_SCALE = 3;

export default function QrMenuScreen() {
  const qr = useQrMenu();
  const { showToast } = useToast();
  const posterRef = useRef<View>(null);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const xml = useMemo(() => {
    const decoded = qr.data ? decodeSvgDataUri(qr.data.qrImageUrl) : null;
    return decoded ? adaptPosterSvg(decoded) : null;
  }, [qr.data]);

  async function run(kind: "save" | "share") {
    setActionError(null);
    setBusy(kind);
    try {
      const uri = await captureRef(posterRef, {
        format: "png",
        result: "tmpfile",
        width: POSTER.width * EXPORT_SCALE,
        height: POSTER.height * EXPORT_SCALE,
      });
      const file = await imageToFile(uri, `qr-menu-${Date.now()}.png`);
      const result: SaveResult =
        kind === "save" ? await saveToGallery(file) : await shareImage(file, "Bagikan QR Menu");
      if (!result.ok) setActionError(result.message);
      else if (kind === "save") showToast("QR Menu disimpan ke galeri");
    } catch {
      setActionError("Gambar QR gagal dibuat. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    if (!qr.data) return;
    await Clipboard.setStringAsync(qr.data.url);
    showToast("Link menu disalin");
  }

  return (
    <SubScreen
      title="QR Menu"
      footer={
        qr.data && xml ? (
          <>
            {actionError ? <Alert tone="error" message={actionError} /> : null}
            <Button
              label="Simpan ke galeri"
              size="lg"
              fullWidth
              loading={busy === "save"}
              disabled={busy !== null}
              icon={<MaterialCommunityIcons name="download" size={22} color={colors.onBrand} />}
              onPress={() => run("save")}
            />
            <Button
              label="Bagikan"
              variant="secondary"
              fullWidth
              loading={busy === "share"}
              disabled={busy !== null}
              icon={
                <MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.ink} />
              }
              onPress={() => run("share")}
            />
          </>
        ) : undefined
      }
    >
      {qr.data && xml ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={type.caption}>
            Cetak atau tempel QR ini di gerobak atau meja. Pembeli tinggal pindai pakai kamera HP
            untuk melihat menu dan memesan langsung.
          </Text>
          <View style={styles.posterWrap}>
            <View ref={posterRef} collapsable={false} style={styles.poster}>
              <SvgXml xml={xml} width="100%" height="100%" />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salin link menu"
            onPress={copyLink}
            android_ripple={{ color: colors.line }}
            style={styles.link}
          >
            <MaterialCommunityIcons name="link-variant" size={20} color={colors.inkMuted} />
            <Text style={[type.caption, styles.linkText]} numberOfLines={1}>
              {qr.data.url}
            </Text>
            <Text style={styles.copy}>Salin</Text>
          </Pressable>
        </ScrollView>
      ) : qr.error || (qr.data && !xml) ? (
        <View style={styles.content}>
          <Alert
            tone="error"
            message={qr.error ? errorMessage(qr.error) : "QR Menu belum tersedia."}
          />
          <Button label="Coba lagi" variant="secondary" onPress={() => qr.refetch()} />
        </View>
      ) : (
        <View style={styles.center}>
          <Spinner size="large" />
        </View>
      )}
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    gap: space.lg,
  },
  posterWrap: { alignItems: "center" },
  poster: { width: "88%", maxWidth: 360, aspectRatio: POSTER.width / POSTER.height },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: touch.min,
    paddingHorizontal: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  linkText: { flex: 1 },
  copy: { ...type.label, color: colors.brandStrong },
});
