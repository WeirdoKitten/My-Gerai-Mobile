# Changelog Dokumen & Fitur

> Riwayat perubahan dokumen (`docs/*`, `CLAUDE.md`) dan fitur besar aplikasi. Format entri: lihat [docs/DOKUMENTASI.md](docs/DOKUMENTASI.md#format-entri-changelogmd). Entri terbaru di paling atas.

## 2026-10-12 — Tahap 3: kelola Item, buka/tutup Lapak, jadwal

**Dampak:** kode (`app/(tabs)/item`, `app/item/`, `app/jadwal.tsx`, `src/features/{products,lapak}/`, `src/api/` products/lapak, komponen UI baru), `app.config.ts` (plugin `expo-image`, `expo-image-picker`, datetimepicker), `package.json` (`expo-image`, `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`, `@react-native-community/datetimepicker`), `docs/BACKLOG.md`, `docs/ARSITEKTUR-FOLDER.md`, `docs/DESAIN-SISTEM.md`, `docs/TEKNOLOGI.md`, `CLAUDE.md`, `README.md`; BACKLOG repo web.
**Alasan:** User meminta semua tahap dilanjutkan; push (Tahap 1b) ditunda sampai ada Firebase. Tahap 3 lebih dulu karena bisa diuji penuh di emulator.
**Ringkasan:**
- Tab Item: daftar dengan foto, harga, badge Pre-order/Stok/Habis, toggle Tersedia/Habis (optimistik). Form Tambah/Ubah Item setara web: foto galeri/kamera (dikecilkan ke 1280px JPEG 0,7 di HP), harga jual, harga modal, pre-order, stok, varian. Varian disimpan ulang setelah Item, sama dengan web. Konfirmasi "Buang perubahan?" saat keluar dari form yang belum disimpan.
- Kartu status Lapak (Buka/Tutup) di atas tab Pesanan, padanan `OpenToggle` web. Layar Jadwal Operasional dari Profil dengan pemilih jam 24 jam bawaan Android.
- Build native dibuat ulang dengan `expo prebuild --clean`, sekaligus memperbaiki skema deep link lama (`exp+my-gerai`).
- Bug yang ketemu saat uji emulator dan diperbaiki: upload foto gagal karena `fetch` bawaan Expo tidak menerima objek `{ uri }` ala React Native (sekarang `File` dari `expo-file-system`); setelah fast refresh, klien API kehilangan penyedia token sehingga Pedagang dikeluarkan (penyedia token kini didaftarkan ulang tiap render); form Ubah Item dibuat ulang setelah simpan sehingga tidak kembali ke daftar.
- 39 test unit lolos (tambahan: konversi form Item ↔ payload, aturan pre-order, varian, jadwal lewat tengah malam, `assetUrl`). `tsc`, Biome, `expo-doctor` bersih.
- Data uji di database dev: Item "Laksa Ayam" (ditandai Habis). Jadwal Lapak demo dikembalikan kosong setelah uji.
- Belum: foto Lapak (Tahap 4), tombol kamera di HP fisik.

## 2026-10-12 — Tahap 1a: login, daftar, antrean Pesanan, ubah status

**Dampak:** kode (`app/`, `src/api/`, `src/features/`, `src/components/ui/`, `src/lib/`), `app.config.ts` (plugin `expo-secure-store`), `package.json` (`expo-secure-store`, `@react-native-community/netinfo`), `CLAUDE.md`, `README.md`, `docs/BACKLOG.md`, `docs/ARSITEKTUR-FOLDER.md`, `docs/DESAIN-SISTEM.md`, `docs/TEKNOLOGI.md`; BACKLOG repo web (Fase 12b).
**Alasan:** User ingin melihat aplikasi Pedagang yang berfungsi. Keputusan User di Plan mode: Tahap 1 dipecah 1a/1b (push butuh Firebase); empat tab tampil sejak awal (Item dan Laporan "segera hadir"); kartu Pesanan mengikuti web tanpa total.
**Ringkasan:**
- Auth: token di `expo-secure-store`, `AuthProvider` + `Stack.Protected`. `401` menghapus token, mengosongkan cache, dan menampilkan "Sesi berakhir, silakan login kembali." Keluar tetap lokal walau server tidak terjangkau.
- Layar: Masuk, Daftar (field sama dengan web), Status Lapak (pesan server), Pesanan (Aktif/Riwayat, polling 10 detik saat fokus, pull-to-refresh, badge tab), Detail Pesanan, Profil + Keluar, Item/Laporan "segera hadir". Semua lewat `/frontend-design:frontend-design`.
- Aksi Pesanan: maju status, Tandai Lunas (QRIS Pribadi, dengan konfirmasi), Gagal Diantar (alasan + catatan, hitung mundur 15 menit). Tabel transisi disalin dari web hanya untuk memilih tombol; server tetap memutuskan.
- Tidak ada `GET /orders/{id}`: detail diambil dari cache antrean lalu riwayat.
- Tanggal WIB dan nomor HP diformat manual (hasil sama dengan web), diuji unit.
- Bug yang ditemukan saat uji emulator dan diperbaiki: mutation TanStack ditahan selamanya saat offline (sekarang `networkMode: always`); error isian tidak hilang saat diketik ulang; huruf "item" pada teks "segera hadir".
- Review keamanan manual (skill `/security-review` butuh remote `origin`): URL API wajib HTTPS di build rilis, pesan layar menunggu lewat context bukan parameter URL (deep link tidak bisa memalsukan teks), link WhatsApp/Telepon hanya untuk nomor berisi angka.
- Verifikasi: 28 test unit lolos, `tsc` + Biome bersih, `expo-doctor` 21/21. Emulator API 37 terhadap server web lokal: salah login, login, antrean nyata, ubah status sampai Selesai, Riwayat, detail, Profil, Keluar, daftar, akun `pending`, offline, sesi dicabut di server, skala huruf 1.3×.
- Database dev repo web perlu `pnpm db:migrate` (migrasi `0021` belum diterapkan). Belum dicek di emulator: Pesanan Antar dan QRIS Pribadi (belum ada data uji).

## 2026-10-08 — Development build jalan di emulator; perbaikan linker pnpm

**Dampak:** `pnpm-workspace.yaml`, `.npmrc` (dihapus), `CLAUDE.md`, `README.md`, `docs/BACKLOG.md`, `docs/ARSITEKTUR-FOLDER.md`, `docs/DESAIN-SISTEM.md`, `docs/TEKNOLOGI.md`.
**Alasan:** Build native pertama gagal (`ninja: error: manifest 'build.ninja' still dirty after 100 tries`). Penyebabnya: pnpm 11 mengabaikan `node-linker=hoisted` di `.npmrc`, sehingga paket terpasang dalam mode isolated dan path C++ di `node_modules/.pnpm/...` terlalu panjang.
**Ringkasan:**
- `nodeLinker: hoisted` dipindah ke `pnpm-workspace.yaml`, dan `.npmrc` dihapus. Cek dengan `pnpm config get node-linker`.
- Mesin dev disiapkan: Android Studio + SDK API 36, JDK 17 (Zulu), `ANDROID_HOME`, dan long paths Windows. Langkahnya dicatat di README.
- `pnpm android` berhasil di emulator API 37. Layar awal dan `app/dev/komponen.tsx` dicek lewat screenshot: font Plus Jakarta Sans termuat, token warna, kartu Pesanan bergaya tiket, semua badge status, alert, state fokus dan error input, keyboard angka, serta spinner.
- Project EAS terhubung: `@satriapss-team/my-gerai` (akun tim). `app.config.ts` kini berisi `owner: "satriapss-team"`, `extra.eas.projectId`, dan `slug` diganti ke `my-gerai` supaya sama dengan project di dashboard (EAS menolak slug yang berbeda). `eas init` tidak bisa menulis ke config dinamis, jadi diisi manual.
- Belum: HP fisik User.

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
