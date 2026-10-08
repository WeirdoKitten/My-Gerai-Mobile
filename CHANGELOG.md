# Changelog Dokumen & Fitur

> Riwayat perubahan dokumen (`docs/*`, `CLAUDE.md`) dan fitur besar aplikasi. Format entri: lihat [docs/DOKUMENTASI.md](docs/DOKUMENTASI.md#format-entri-changelogmd). Entri terbaru di paling atas.

## 2026-10-07 — Tahap 0: scaffolding Expo

**Dampak:** kode baru (config proyek, `app/`, `src/`, `tests/`), `CLAUDE.md`, `README.md`, `docs/BACKLOG.md`, `docs/ARSITEKTUR-FOLDER.md`, `docs/DESAIN-SISTEM.md`, `docs/TEKNOLOGI.md`.
**Alasan:** User meminta Tahap 0 dikerjakan. Nama aplikasi dan package Android diputuskan User: `MyGerai`, `com.mygerai.pedagang`. Menghubungkan project EAS ditunda sampai User login ke akun Expo.
**Ringkasan:**
- Versi dicek ulang: SDK 57 (`expo@57.0.27`, React Native 0.86.3) tetap stabil terbaru. `expo-doctor` lolos 21/21.
- Proyek dibuat dari template `default@sdk-57`, lalu dirampingkan. Rute ada di `app/` (root), sesuai ARSITEKTUR-FOLDER, bukan `src/app` bawaan template.
- Config: `app.config.ts` (Android saja, mode terang, targetSdk 36 dikunci lewat `expo-build-properties`), `eas.json` (development/preview/production), `.env.example` untuk `EXPO_PUBLIC_API_URL`, Biome (format repo web + urutan import CODING-STYLE), Jest 29 + RNTL 14, `tsconfig` strict dengan alias `@/` dan `types: ["jest"]` (TypeScript 6 tidak lagi memuat tipe global secara otomatis).
- pnpm 11 butuh `pnpm-workspace.yaml`: build script `@parcel/watcher` dan `unrs-resolver` tidak dijalankan (binary prebuilt sudah cukup).
- Desain lewat `/frontend-design:frontend-design`: `src/theme.ts` dan komponen `Button`, `Input`, `Field`, `Card`, `Badge`, `OrderStatusBadge`, `Alert`, `Spinner`. Kartu Pesanan baru bergaya tiket menjadi pola baku (DESAIN-SISTEM §5). Keluarga ikon: `MaterialCommunityIcons`.
- `src/api/client.ts`: base URL, Bearer, timeout 15 detik, pemetaan kode error API-MOBILE §3 + `network`/`timeout`/`invalid_response`, validasi Zod pada amplop dan data, serta hook `onUnauthorized` untuk Tahap 1. QueryClient hanya mengulang GET untuk gangguan sementara.
- `formatRupiah` ditulis manual (`Rp12.000`), karena `Intl` di Hermes menyisipkan spasi.
- 11 test lolos, `tsc` dan Biome bersih, bundle Android lolos `expo export`.
- **Belum diverifikasi di emulator/HP**: Android SDK belum terpasang di mesin dev. Item BACKLOG yang butuh verifikasi nyata belum dicentang.

## 2026-10-07 — Uji akses baca dokumen repo web lolos

**Dampak:** `docs/BACKLOG.md` (Tahap −1 selesai).
**Alasan:** Item uji terakhir Tahap −1: sesi Claude baru harus bisa membaca `../My-Gerai/docs/` tanpa prompt izin.
**Ringkasan:**
- Sesi baru membaca `../My-Gerai/docs/PRD.md` dan `../My-Gerai/docs/GLOSSARY.md` tanpa prompt izin. Izin baca di `.claude/settings.json` berfungsi.
- Tahap −1 selesai. Berikutnya: Tahap 0 scaffolding Expo.

## 2026-10-07 — Sesuaikan dokumen dengan API mobile (Fase 12a selesai di repo web)

**Dampak:** `CLAUDE.md`, `docs/ARSITEKTUR-SISTEM.md` (alur auth + push, ADR baru), `docs/ARSITEKTUR-FOLDER.md`, `docs/BACKLOG.md`, `docs/BEST-PRACTICES.md`, `docs/CLAUDE-SKILLS.md`, `docs/RULES.md`, `docs/DOKUMENTASI.md`, `docs/TEKNOLOGI.md`.
**Alasan:** Keputusan User di Plan mode Fase 12a: token tunggal 90 hari bergeser (bukan access + refresh token), push lewat Expo Push Service. Kontrak API kini ada di `../My-Gerai/docs/API-MOBILE.md`.
**Ringkasan:**
- Aplikasi tidak perlu logika refresh token; `401` = kembali ke login.
- Token push yang didaftarkan adalah token Expo (`PUT /devices`), channel notifikasi Android wajib ber-id `pesanan`.
- Endpoint geocoding belum ada; cara peta di aplikasi diputuskan saat Tahap 4.

## 2026-10-07 — Fondasi dokumentasi aplikasi Android Pedagang

**Dampak:** `CLAUDE.md`, `README.md`, `.gitignore`, `.claude/settings.json`, seluruh `docs/` (RULES, DOKUMENTASI, TEKNOLOGI, ARSITEKTUR-SISTEM, ARSITEKTUR-FOLDER, CODING-STYLE, DESAIN-SISTEM, BEST-PRACTICES, BACKLOG, CLAUDE-SKILLS, PROMPT-TIPS).
**Alasan:** User memutuskan membuat aplikasi Android khusus Pedagang (keputusan dan alternatif yang ditolak: ADR 2026-10-07 di repo web). User meminta repo baru dimulai dengan aturan dan dokumentasi yang memudahkan pengembangan ke depan, termasuk aturan memakai `/frontend-design:frontend-design` untuk semua desain UI.
**Ringkasan:**
- Stack: React Native + Expo SDK 57 (development build), expo-router, TanStack Query, Zod, StyleSheet + token tema, expo-secure-store, expo-notifications (FCM), react-native-ble-plx, Jest/RNTL, Maestro, EAS, pnpm hoisted. Versi dicek lewat web search 2026-10-07.
- Dokumen domain (PRD, DATA-MODEL, GLOSSARY, kontrak API) **tidak disalin**; dirujuk ke `../My-Gerai/docs/`. Claude diberi akses baca ke repo web lewat `.claude/settings.json`.
- Belum ada kode. Berikutnya: Fase 12a (API mobile) di repo web, lalu Tahap 0 scaffolding di sini.
