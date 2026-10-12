import type { Coordinates } from "@/api/schemas/profile";

// Konstanta sama dengan peta web (src/components/merchant/map/types.ts).
export const INDONESIA_CENTER: Coordinates = { latitude: -2.5, longitude: 118 };
const DEFAULT_ZOOM = 4;
export const PICKED_ZOOM = 17;
/** Di bawah zoom ini geseran peta tidak memasang titik (terlalu jauh untuk akurat). */
const MIN_PICK_ZOOM = 13;

/** Pesan dari halaman peta ke aplikasi. */
export type MapMessage =
  | { type: "ready" }
  | { type: "failed" }
  | { type: "center"; latitude: number; longitude: number }
  | { type: "zoomHint" };

export function parseMapMessage(raw: string): MapMessage | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || !("type" in data)) return null;
    const message = data as MapMessage;
    if (message.type === "center") {
      const { latitude, longitude } = message;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    }
    return message;
  } catch {
    return null;
  }
}

/** Perintah dari aplikasi ke halaman peta (dipanggil lewat `injectJavaScript`). */
export function flyToScript({ latitude, longitude }: Coordinates): string {
  return `window.flyToPoint && window.flyToPoint(${Number(latitude)}, ${Number(longitude)}); true;`;
}

/**
 * Halaman Leaflet + tile OpenStreetMap di dalam WebView. Pin digambar aplikasi di atas
 * WebView (tetap di tengah), halaman ini hanya melaporkan pusat peta setelah digeser.
 * Leaflet dari unpkg dengan SRI supaya file yang dimuat tidak bisa diganti diam-diam.
 */
export function buildMapHtml(initial: Coordinates | null): string {
  const start = initial ?? INDONESIA_CENTER;
  const zoom = initial ? PICKED_ZOOM - 1 : DEFAULT_ZOOM;
  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<style>
  html, body, #map { height: 100%; margin: 0; background: #F4F1EC; }
  .leaflet-control-attribution { font: 10px sans-serif; }
  .leaflet-bar a { width: 36px; height: 36px; line-height: 36px; }
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""
  onerror="window.ReactNativeWebView.postMessage(JSON.stringify({type:'failed'}))"></script>
<script>
(function () {
  function post(message) { window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
  if (!window.L) { post({ type: 'failed' }); return; }
  var map = L.map('map', { zoomControl: true }).setView([${start.latitude}, ${start.longitude}], ${zoom});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  map.attributionControl.setPrefix(false);

  var programmatic = false;
  var last = map.getCenter();
  map.on('dragstart', function () { programmatic = false; });
  map.on('click', function (e) { programmatic = false; map.panTo(e.latlng); });
  map.on('moveend', function () {
    var center = map.getCenter();
    var previous = last;
    last = center;
    if (programmatic) { programmatic = false; return; }
    if (map.getZoom() < ${MIN_PICK_ZOOM}) { post({ type: 'zoomHint' }); return; }
    if (Math.abs(previous.lat - center.lat) < 1e-7 && Math.abs(previous.lng - center.lng) < 1e-7) return;
    post({ type: 'center', latitude: center.lat, longitude: center.lng });
  });
  window.flyToPoint = function (lat, lng) {
    programmatic = true;
    map.flyTo([lat, lng], ${PICKED_ZOOM}, { duration: 0.8 });
  };
  post({ type: 'ready' });
})();
</script>
</body></html>`;
}
