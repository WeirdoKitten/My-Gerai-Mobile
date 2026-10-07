# Changelog Dokumen & Fitur

> Riwayat perubahan dokumen (`docs/*`, `CLAUDE.md`) dan fitur besar aplikasi. Format entri: lihat [docs/DOKUMENTASI.md](docs/DOKUMENTASI.md#format-entri-changelogmd). Entri terbaru di paling atas.

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
