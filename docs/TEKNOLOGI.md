# Teknologi — Stack & Alasan Pemilihan

> Prinsip: **cepat, ringan, minim biaya, hemat effort dev**, dan sebisa mungkin **sebahasa dengan repo web** (TypeScript) supaya Claude dan User tidak berganti konteks. Setiap pilihan wajib punya alasan tertulis. Kalau berubah, catat di [CHANGELOG.md](../CHANGELOG.md) dan baris ADR di [ARSITEKTUR-SISTEM.md](ARSITEKTUR-SISTEM.md).
>
> **Versi dicek 2026-10-07** lewat web search (lihat Sumber di bawah). Cek ulang saat scaffolding dan setiap upgrade.

## Ringkasan Stack

| Layer | Pilihan | Alasan Singkat |
|---|---|---|
| Bahasa | **TypeScript** (strict) | Sama dengan repo web. Tipe respons API bisa ditulis dengan pola yang sama. |
| Framework | **React Native + Expo**, **SDK 57** (React Native 0.86) | Keputusan User 2026-10-07. Expo mengurus build native, config plugin, update SDK, dan rilis Play Store tanpa harus menyentuh Android Studio sehari-hari. SDK 58 masih beta (rilis beta 2026-09-15); pakai versi stabil terbaru saat scaffolding. |
| Mode build | **Development build** (`expo-dev-client`), **bukan Expo Go** | Expo Go tidak memuat modul native BLE. Development build dipakai untuk dev harian; build produksi lewat EAS. |
| Navigasi | **expo-router** (routing berbasis file di `app/`) | Pola mirip App Router Next.js di repo web, sudah dikenal. Bawaan template Expo. |
| Server state & polling | **TanStack Query** | Cache, retry, refetch saat aplikasi kembali aktif, dan polling antrean Pesanan saat layar terbuka. Menggantikan kebutuhan state manager global. |
| State lokal | `useState`/`useReducer` + React Context seperlunya | Tidak perlu Redux/Zustand. Tambah library hanya kalau kebutuhan nyata muncul (catat di sini). |
| Validasi | **Zod** | Sama dengan repo web. Dipakai untuk form dan **memvalidasi respons API** di batas sistem. |
| HTTP | `fetch` bawaan dibungkus satu klien (`src/api/client.ts`) | Tanpa axios. Klien mengurus base URL, header token, timeout, dan pemetaan error (format di [API-MOBILE §3](../../My-Gerai/docs/API-MOBILE.md#3-format-respons)). |
| Penyimpanan token | **expo-secure-store** | Disimpan di Android Keystore. Wajib untuk token ([RULES §7.2](RULES.md#7-keamanan)). |
| Preferensi non-rahasia | AsyncStorage (`@react-native-async-storage/async-storage`) | Contoh: printer terakhir dipakai. Tidak untuk token atau data sensitif. |
| Push notification | **expo-notifications** + **Firebase Cloud Messaging (FCM) v1** | Notifikasi Pesanan lunas tetap masuk saat aplikasi tertutup atau HP terkunci. Kredensial FCM v1 diunggah ke EAS. Server (repo web) mengirim lewat **Expo Push Service** ke token Expo yang didaftarkan aplikasi (`PUT /devices`). Format push: [API-MOBILE §5](../../My-Gerai/docs/API-MOBILE.md#5-push-notification). |
| Printer thermal | **react-native-ble-plx** v3 + config plugin `@config-plugins/react-native-ble-plx` + **encoder ESC/POS buatan sendiri** | ble-plx v3 mendukung New Architecture dan menjadi klien BLE standar React Native. Config plugin menambah izin `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT` (Android 12+). Encoder di-port dari `src/lib/utils/receipt.ts` repo web supaya isi struk identik. Batasan sama dengan web: printer **wajib BLE**. |
| Foto Item | **expo-image-picker** + **expo-image-manipulator** | Ambil dari kamera/galeri, kompres dan perkecil di HP sebelum upload (hemat kuota). |
| Tampilan gambar | **expo-image** | Cache disk, placeholder, performa lebih baik daripada `Image` bawaan. |
| Styling | **StyleSheet bawaan + `src/theme.ts`** | Keputusan User 2026-10-07. Tanpa dependency. Token diturunkan dari desain sistem web. Lihat [DESAIN-SISTEM.md](DESAIN-SISTEM.md). |
| Font | **Plus Jakarta Sans** via `@expo-google-fonts/plus-jakarta-sans` + `expo-font` | Sama dengan web. |
| Ikon | **@expo/vector-icons** (set terbatas, lihat DESAIN-SISTEM) | Bawaan Expo, tidak menambah dependency besar. |
| Grafik Laporan | Ditentukan saat Tahap 4 (kandidat: `react-native-svg` + komponen sendiri) | Jangan tambah library chart besar sebelum ada kebutuhan konkret. Pakai skill `dataviz`. |
| Lint & format | **Biome** | Sama dengan repo web. |
| Unit/komponen test | **Jest** (`jest-expo`) + **React Native Testing Library** | Preset resmi Expo. Vitest belum didukung baik untuk React Native. |
| E2E | **Maestro** (`.maestro/*.yaml`) | Alur di emulator/HP nyata dengan YAML sederhana, lebih ringan daripada Detox. |
| Build & rilis | **EAS Build** + **EAS Submit** (Play Store) | Build Android di cloud, keystore dikelola EAS, upload ke Play Console otomatis. Free tier cukup untuk awal. |
| Update OTA | **expo-updates** (EAS Update), opsional | Perbaikan JS kecil tanpa rilis Play Store. Diaktifkan saat Tahap 5, setelah ada kebijakan kapan boleh dipakai. |
| Package manager | **pnpm** dengan `.npmrc` berisi `node-linker=hoisted` | Sama dengan repo web. Expo **masih mensyaratkan** hoisted untuk pnpm; tanpa itu bisa ada dua salinan `react-native` dan crash saat start. |
| Monitoring error (nanti) | Sentry (`@sentry/react-native`), free tier | Setelah rilis uji tertutup, bukan blocker awal. |

## Target Android

- **targetSdk 36 (Android 16)**: wajib untuk aplikasi baru dan update di Play Store sejak 31 Agustus 2026. Saat scaffolding, cek nilai default `targetSdkVersion` Expo SDK yang dipakai; kalau di bawah 36, atur lewat `expo-build-properties`.
- **minSdk**: ikuti default Expo SDK 57. Jangan diturunkan tanpa diskusi (HP Pedagang mungkin lama, tapi Android sangat lama tidak didukung React Native terbaru).

## Kenapa Bukan Alternatif Lain?

- **PWA + TWA / Capacitor**: diusulkan Claude sebagai jalur termurah (memakai ulang dashboard web). User memilih aplikasi native (2026-10-07) untuk kepercayaan di Play Store, notifikasi yang andal, cetak struk, dan ruang untuk fitur native ke depan. Catatan: Capacitor (WebView) tidak mendukung Web Bluetooth.
- **Flutter / Kotlin native**: bahasa baru (Dart/Kotlin), tidak sebahasa dengan web. Dipertimbangkan, tidak dipilih.
- **NativeWind**: kelas mirip Tailwind web, tapi menambah lapisan build yang kadang tertinggal dari versi Expo terbaru. User memilih StyleSheet + token (2026-10-07).
- **Redux/Zustand**: state server sudah ditangani TanStack Query. State global tersisa sangat sedikit (sesi login).
- **Detox**: lebih berat disiapkan daripada Maestro untuk tim kecil.

## Batasan Biaya

| Item | Biaya | Catatan |
|---|---|---|
| Google Play Console | US$25 sekali bayar | Akun atas nama User. Akun pribadi baru wajib uji tertutup (closed testing) dengan sejumlah penguji selama periode tertentu sebelum boleh rilis produksi. Cek syarat terbaru saat Tahap 5. |
| EAS Build/Submit | Free tier (kuota build bulanan terbatas) | Kalau antrean build lambat atau kuota habis, opsi build lokal (`eas build --local`) atau naik paket dibahas dengan User. |
| Firebase (FCM) | Gratis | Hanya dipakai untuk push. |
| Expo Push Service | Gratis | Dipakai server untuk mengirim push (keputusan Fase 12a). |

## Sumber (dicek 2026-10-07)

- [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57), [Expo SDK 58 beta](https://expo.dev/changelog/sdk-58-beta)
- [React Native BLE dengan Expo (2026)](https://reactnativerelay.com/article/react-native-ble-plx-expo-tutorial-2026)
- [Syarat target API Google Play](https://developer.android.com/google/play/requirements/target-sdk)
- [Opsi node-linker pnpm](https://pnpm.io/blog/2020/10/17/node-modules-configuration-options-with-pnpm)
