# Backlog — Aplikasi Android Pedagang

> Task aplikasi per tahap. Pekerjaan backend (endpoint, auth token, push) ada di **Fase 12a** (kode selesai 2026-10-07, kontrak: [API-MOBILE.md](../../My-Gerai/docs/API-MOBILE.md)) [BACKLOG repo web](../../My-Gerai/docs/BACKLOG.md). Setiap tahap di sini bergantung pada endpoint terkait di sana sudah tersedia.
>
> Keputusan User (2026-10-07): React Native + Expo, repo terpisah, cakupan v1 setara dashboard web Pedagang, daftar + login di aplikasi, dokumen domain dirujuk dari repo web, styling StyleSheet + token.

## Tahap −1 — Fondasi Dokumentasi ✅

- [x] `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `.claude/settings.json`.
- [x] `docs/`: RULES, DOKUMENTASI, TEKNOLOGI, ARSITEKTUR-SISTEM, ARSITEKTUR-FOLDER, CODING-STYLE, DESAIN-SISTEM, BEST-PRACTICES, BACKLOG, CLAUDE-SKILLS, PROMPT-TIPS.
- [ ] Uji: buka sesi Claude baru di repo ini, pastikan dokumen `../My-Gerai/docs/` bisa dibaca tanpa prompt izin.

## Tahap 0 — Scaffolding

- [ ] Cek ulang versi stabil Expo SDK, perbarui [TEKNOLOGI.md](TEKNOLOGI.md) kalau berubah.
- [ ] `create-expo-app` (template expo-router, TypeScript), `.npmrc` `node-linker=hoisted`, pnpm.
- [ ] `tsconfig` strict + alias `@/`, Biome (sesuaikan dengan konfigurasi repo web), Jest (`jest-expo`) + RNTL, satu test contoh.
- [ ] `app.config.ts`: nama aplikasi, package Android (ditanyakan ke User), ikon & splash sementara, `EXPO_PUBLIC_API_URL`, targetSdk 36.
- [ ] `expo-dev-client`, `eas.json` (profil development, preview, production), hubungkan project EAS (akun Expo User).
- [ ] `src/theme.ts` + font Plus Jakarta Sans + komponen UI baku awal (Button, Input, Field, Card, Badge, Alert, Spinner) lewat `/frontend-design:frontend-design`.
- [ ] Layar contoh komponen (hanya di build development) untuk review visual.
- [ ] `src/api/client.ts` (base URL, timeout, pemetaan format error [API-MOBILE §3](../../My-Gerai/docs/API-MOBILE.md#3-format-respons)) + `QueryClientProvider`.
- [ ] Development build berjalan di emulator dan HP User.
- [ ] Perbarui ARSITEKTUR-FOLDER, README (cara menjalankan), CHANGELOG.

## Tahap 1 — Login, Daftar, Antrean Pesanan, Push

Bergantung: endpoint auth, daftar, Pesanan, registrasi token push (Fase 12a).

- [ ] Login No. HP + password, simpan token di secure store, `401` → kembali ke login, logout.
- [ ] Pendaftaran Pedagang (alur dan field sama dengan `/daftar` web), layar status menunggu persetujuan Admin.
- [ ] Antrean Pesanan aktif + riwayat, polling saat layar aktif, pull-to-refresh.
- [ ] Detail Pesanan + ubah status (proses, siap, selesai, gagal antar) + tandai lunas untuk QRIS Pribadi.
- [ ] Push notification: izin, channel Pesanan dengan bunyi, registrasi token, ketuk notifikasi membuka detail.
- [ ] Panduan penghemat baterai untuk merek tertentu.
- [ ] Maestro: login → antrean → ubah status sampai selesai.
- [ ] Uji push nyata di HP (aplikasi tertutup, HP terkunci). `/security-review`.

## Tahap 2 — Cetak Struk Bluetooth

- [ ] Port encoder ESC/POS dari repo web, unit test byte identik.
- [ ] Scan, pilih, simpan printer; kirim per potongan MTU; pesan error jelas.
- [ ] Pratinjau struk + tombol cetak di detail Pesanan dan riwayat.
- [ ] Uji dengan printer thermal 58mm nyata.

## Tahap 3 — Kelola Item & Lapak

- [ ] Daftar Item, tambah/ubah, harga, harga modal, stok, aktif/nonaktif.
- [ ] Varian Item (grup + opsi + selisih harga).
- [ ] Foto Item dan foto Lapak (kamera/galeri, kompres, upload).
- [ ] Buka/tutup Lapak + jadwal operasional.

## Tahap 4 — Laporan, Profil, Uang, Lainnya

- [ ] Laporan penjualan + asisten rekomendasi (skill `dataviz`).
- [ ] Profil Lapak, alamat + titik peta (endpoint geocoding belum ada; putuskan dulu cara peta di aplikasi native, lalu buat endpoint di repo web), QR Menu (lihat/unduh/bagikan).
- [ ] Pengaturan pengantaran (tarif, radius).
- [ ] Mode pembayaran, rekening Pencairan, riwayat Pencairan/Saldo.
- [ ] Tagihan Biaya Layanan (QRIS Pribadi): daftar dan bayar.
- [ ] Ulasan Gerai.
- [ ] Event yang diikuti Gerai.

## Tahap 5 — Rilis Play Store

- [ ] **User:** akun Google Play Console (US$25), project Firebase + kredensial FCM v1 diunggah ke EAS, halaman kebijakan privasi (URL publik).
- [ ] Ikon, splash, screenshot Play Store final (`/frontend-design:frontend-design`).
- [ ] Formulir Data Safety, rating konten, deklarasi izin.
- [ ] Sentry, EAS Update (kebijakan kapan boleh OTA).
- [ ] Uji tertutup dengan Pedagang nyata, lalu rilis produksi.

## Ide Masa Depan (belum dijadwalkan)

- [ ] Versi iOS.
- [ ] Widget layar utama Android (jumlah Pesanan hari ini).
- [ ] Mode tablet/kasir untuk Lapak yang lebih besar.
- [ ] Antrean aksi offline (ditolak untuk v1, lihat ADR di [ARSITEKTUR-SISTEM.md](ARSITEKTUR-SISTEM.md#keputusan-arsitektur-adr)).
