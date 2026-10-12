import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { searchPlaces } from "@/api/endpoints/profile";
import type { Coordinates, PlaceSuggestion } from "@/api/schemas/profile";
import { Button, Input, Spinner } from "@/components/ui";
import { colors, fonts, radius, space, touch, type } from "@/theme";

import { buildMapHtml, flyToScript, parseMapMessage } from "./map-html";

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY = 3;
// Longgar: dialog "Location Accuracy" Android bisa muncul dulu sebelum lokasi dicari.
const LOCATE_TIMEOUT_MS = 30_000;
const RECENT_LOCATION_MS = 2 * 60_000;
const RECENT_ACCURACY_M = 100;
const MAP_HEIGHT = 240;
const PIN = 44;

type LocationPickerProps = {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  /** Dipanggil saat jari menyentuh/melepas peta, supaya layar induk berhenti menggulir. */
  onMapTouch?: (active: boolean) => void;
};

// Origin server API dikirim sebagai Referer ke server tile OSM (kebijakan tile OSM).
const MAP_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.match(/^https?:\/\/[^/]+/)?.[0];

/**
 * Pemilih titik Lapak: cari alamat, peta OSM (WebView Leaflet) dengan pin tetap di tengah,
 * dan "Pakai lokasi saya". Padanan LocationMapPicker web mode OSM.
 */
export function LocationPicker({ value, onChange, onMapTouch }: LocationPickerProps) {
  const webRef = useRef<WebView>(null);
  // HTML dibuat sekali dari titik awal; perpindahan berikutnya lewat flyTo.
  const [html] = useState(() => buildMapHtml(value));
  const [mapState, setMapState] = useState<"loading" | "ready" | "failed">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [zoomHint, setZoomHint] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function placeAt(coords: Coordinates) {
    onChange(coords);
    setZoomHint(false);
    webRef.current?.injectJavaScript(flyToScript(coords));
  }

  async function useMyLocation() {
    setGeoError(null);
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setGeoError(
          "Izin lokasi ditolak. Cari alamat atau geser peta, atau aktifkan izin di Pengaturan HP.",
        );
        return;
      }
      // Lokasi terakhir yang masih baru langsung dipakai (cepat, hemat baterai); kalau tidak ada, cari baru.
      const recent = await Location.getLastKnownPositionAsync({
        maxAge: RECENT_LOCATION_MS,
        requiredAccuracy: RECENT_ACCURACY_M,
      });
      const position =
        recent ??
        (await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), LOCATE_TIMEOUT_MS)),
        ]));
      if (!position) throw new Error("timeout");
      placeAt({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch {
      setGeoError(
        "Lokasi belum didapat. Pastikan GPS menyala, atau cari alamat dan geser peta sendiri.",
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <View style={styles.root}>
      <PlaceSearch near={value} onPick={placeAt} />

      <View
        style={styles.map}
        onTouchStart={() => onMapTouch?.(true)}
        onTouchEnd={() => onMapTouch?.(false)}
        onTouchCancel={() => onMapTouch?.(false)}
      >
        <WebView
          key={reloadKey}
          ref={webRef}
          source={{ html, baseUrl: MAP_BASE_URL }}
          originWhitelist={["*"]}
          applicationNameForUserAgent="MyGerai"
          javaScriptEnabled
          domStorageEnabled={false}
          allowFileAccess={false}
          mixedContentMode="never"
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          // Peta tidak boleh membuka halaman lain di dalam WebView.
          onShouldStartLoadWithRequest={(request) =>
            request.url === "about:blank" || request.url.startsWith(MAP_BASE_URL ?? "about:")
          }
          onMessage={(event) => {
            const message = parseMapMessage(event.nativeEvent.data);
            if (!message) return;
            if (message.type === "ready") setMapState("ready");
            if (message.type === "failed") setMapState("failed");
            if (message.type === "zoomHint") setZoomHint(true);
            if (message.type === "center") {
              setZoomHint(false);
              onChange({ latitude: message.latitude, longitude: message.longitude });
            }
          }}
          onError={() => setMapState("failed")}
          style={styles.web}
        />
        {mapState === "ready" ? (
          <View pointerEvents="none" style={styles.pinWrap}>
            <MaterialCommunityIcons
              name="map-marker"
              size={PIN}
              color={colors.brand}
              style={!value && styles.pinIdle}
            />
            <View style={styles.pinShadow} />
          </View>
        ) : (
          <View style={styles.overlay}>
            {mapState === "loading" ? (
              <Spinner size="large" />
            ) : (
              <>
                <MaterialCommunityIcons name="map-outline" size={32} color={colors.inkMuted} />
                <Text style={[type.caption, styles.center]}>
                  Peta tidak bisa dimuat. Periksa koneksi internet.
                </Text>
                <Button
                  label="Muat ulang peta"
                  variant="secondary"
                  onPress={() => {
                    setMapState("loading");
                    setReloadKey((k) => k + 1);
                  }}
                />
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          label="Pakai lokasi saya"
          variant="secondary"
          loading={locating}
          icon={<MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.ink} />}
          onPress={useMyLocation}
        />
        {value ? (
          <Button label="Hapus titik" variant="ghost" onPress={() => onChange(null)} />
        ) : null}
      </View>

      {geoError ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {geoError}
        </Text>
      ) : (
        <Text style={type.micro}>
          {zoomHint
            ? "Perbesar peta dulu sampai jalan terlihat jelas, lalu geser ke titik Lapak."
            : value
              ? "Titik terpasang. Geser peta kalau pin belum tepat di Lapak."
              : "Cari alamat, pakai lokasi saya, atau perbesar peta lalu geser sampai pin tepat di Lapak."}
        </Text>
      )}
    </View>
  );
}

function PlaceSearch({
  near,
  onPick,
}: {
  near: Coordinates | null;
  onPick: (coords: Coordinates) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSuggestion[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  // Titik acuan cukup dibaca saat mengetik; tidak memicu pencarian ulang saat peta digeser.
  const nearRef = useRef(near);
  nearRef.current = near;

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) {
      setResults(null);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    setFailed(false);
    const timer = setTimeout(() => {
      searchPlaces(trimmed, nearRef.current, controller.signal)
        .then((data) => setResults(data.suggestions))
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  function pick(suggestion: PlaceSuggestion) {
    if (!suggestion.coords) return;
    onPick(suggestion.coords);
    setQuery("");
    setResults(null);
  }

  return (
    <View style={styles.search}>
      <View>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Cari jalan, gedung, atau patokan"
          returnKeyType="search"
          autoCorrect={false}
          style={styles.searchInput}
          accessibilityLabel="Cari alamat Lapak"
        />
        <View pointerEvents="none" style={styles.searchIcon}>
          {searching ? (
            <Spinner />
          ) : (
            <MaterialCommunityIcons name="magnify" size={22} color={colors.inkMuted} />
          )}
        </View>
      </View>
      {failed ? (
        <Text style={styles.error}>Pencarian gagal. Periksa koneksi lalu coba lagi.</Text>
      ) : results && !searching ? (
        results.length === 0 ? (
          <Text style={type.micro}>Alamat tidak ditemukan. Coba kata lain atau geser peta.</Text>
        ) : (
          <View style={styles.results}>
            {results.slice(0, 5).map((suggestion, index) => (
              <Pressable
                key={suggestion.id}
                accessibilityRole="button"
                onPress={() => pick(suggestion)}
                android_ripple={{ color: colors.brandTint }}
                style={[styles.result, index > 0 && styles.resultBorder]}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={colors.brandStrong}
                />
                <View style={styles.resultText}>
                  <Text style={type.label} numberOfLines={1}>
                    {suggestion.title}
                  </Text>
                  {suggestion.subtitle ? (
                    <Text style={type.micro} numberOfLines={2}>
                      {suggestion.subtitle}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  search: { gap: space.sm },
  searchInput: { paddingLeft: space.lg + 28 },
  searchIcon: {
    position: "absolute",
    left: space.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  results: {
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: touch.min + space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  resultBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  resultText: { flex: 1, gap: 2 },
  map: {
    height: MAP_HEIGHT,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    backgroundColor: colors.neutralBg,
  },
  web: { flex: 1, backgroundColor: colors.neutralBg },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
    padding: space.xl,
    backgroundColor: colors.neutralBg,
  },
  center: { textAlign: "center" },
  // Ujung bawah ikon tepat di pusat peta.
  pinWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: PIN,
    height: PIN,
    marginLeft: -PIN / 2,
    marginTop: -PIN + 3,
    alignItems: "center",
  },
  pinIdle: { opacity: 0.55 },
  pinShadow: {
    position: "absolute",
    bottom: -4,
    width: 10,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    opacity: 0.25,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.danger },
});
