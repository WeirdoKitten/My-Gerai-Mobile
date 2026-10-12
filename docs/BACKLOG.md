# Backlog — Aplikasi Android Pedagang

> Task aplikasi per tahap. Pekerjaan backend (endpoint, auth token, push) ada di **Fase 12a** (kode selesai 2026-10-07, kontrak: [API-MOBILE.md](../../My-Gerai/docs/API-MOBILE.md)) [BACKLOG repo web](../../My-Gerai/docs/BACKLOG.md). Setiap tahap di sini bergantung pada endpoint terkait di sana sudah tersedia.
>
> Keputusan User (2026-10-07): React Native + Expo, repo terpisah, cakupan v1 setara dashboard web Pedagang, daftar + login di aplikasi, dokumen domain dirujuk dari repo web, styling StyleSheet + token.

## Tahap −1 — Fondasi Dokumentasi ✅

- [x] `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `.claude/settings.json`.
- [x] `docs/`: RULES, DOKUMENTASI, TEKNOLOGI, ARSITEKTUR-SISTEM, ARSITEKTUR-FOLDER, CODING-STYLE, DESAIN-SISTEM, BEST-PRACTICES, BACKLOG, CLAUDE-SKILLS, PROMPT-TIPS.
- [x] Uji: buka sesi Claude baru di repo ini, pastikan dokumen `../My-Gerai/docs/` bisa dibaca tanpa prompt izin. (2026-10-07, lolos)

## Tahap 0 — Scaffolding

- [x] Cek ulang versi stabil Expo SDK, perbarui [TEKNOLOGI.md](TEKNOLOGI.md) kalau berubah. (SDK 57 tetap stabil terbaru, `expo@57.0.27`.)
- [x] `create-expo-app` (template expo-router, TypeScript), pnpm dengan linker hoisted (`nodeLinker: hoisted` di `pnpm-workspace.yaml`; pnpm 11 mengabaikan `.npmrc` untuk setting ini).
- [x] `tsconfig` strict + alias `@/`, Biome (sesuaikan dengan konfigurasi repo web), Jest (`jest-expo`) + RNTL, satu test contoh.
- [x] `app.config.ts`: nama aplikasi, package Android (ditanyakan ke User), ikon & splash sementara, `EXPO_PUBLIC_API_URL`, targetSdk 36. (Nama `MyGerai`, package `com.mygerai.pedagang`; ikon & splash masih bawaan template Expo; URL API lewat `.env`.)
- [x] `expo-dev-client`, `eas.json` (profil development, preview, production), hubungkan project EAS (akun Expo User). (Project `@satriapss-team/my-gerai`, `projectId` + `owner` di `app.config.ts`, 2026-10-08. `EXPO_PUBLIC_API_URL` staging/produksi diisi saat URL-nya ada.)
- [x] `src/theme.ts` + font Plus Jakarta Sans + komponen UI baku awal (Button, Input, Field, Card, Badge, Alert, Spinner) lewat `/frontend-design:frontend-design`. (Dicek di emulator 2026-10-08: font, warna, badge, alert, state fokus/error input, spinner.)
- [x] Layar contoh komponen (hanya di build development) untuk review visual. (`app/dev/komponen.tsx`, dicek di emulator 2026-10-08.)
- [x] `src/api/client.ts` (base URL, timeout, pemetaan format error [API-MOBILE §3](../../My-Gerai/docs/API-MOBILE.md#3-format-respons)) + `QueryClientProvider`. (Diuji unit dengan fetch tiruan; panggilan nyata ke server menyusul bersama development build.)
- [ ] Development build berjalan di emulator dan HP User. (Emulator API 37 **lolos** 2026-10-08 lewat `pnpm android`. **Sisa**: HP fisik User.)
- [x] Perbarui ARSITEKTUR-FOLDER, README (cara menjalankan), CHANGELOG.

## Tahap 1 — Login, Daftar, Antrean Pesanan, Push

Bergantung: endpoint auth, daftar, Pesanan, registrasi token push (Fase 12a). Dipecah 1a/1b atas keputusan User (2026-10-12): push butuh project Firebase.

### Tahap 1a — Login, Daftar, Antrean, Ubah Status

- [x] Login No. HP + password, simpan token di secure store, `401` → kembali ke login, logout. (Dicek di emulator 2026-10-12: salah login, login, sesi dicabut di server → kembali ke login dengan pesan, Keluar dengan konfirmasi.)
- [x] Pendaftaran Pedagang (alur dan field sama dengan `/daftar` web), layar status menunggu persetujuan Admin. (Dicek di emulator: daftar akun baru, login akun `pending`.)
- [x] Antrean Pesanan aktif + riwayat, polling saat layar aktif, pull-to-refresh. (Polling 10 detik hanya saat tab Pesanan fokus dan aplikasi aktif.)
- [x] Detail Pesanan + ubah status (proses, siap, selesai) + tandai lunas untuk QRIS Pribadi + gagal antar. (Ambil Sendiri dicek di emulator sampai `selesai` dan pindah ke Riwayat. **Belum dicek di emulator**: Pesanan Antar + sheet Gagal Diantar, dan Tandai Lunas QRIS Pribadi, karena data seed dev belum punya Pesanan jenis itu. Logika transisi dan hitung mundur 15 menit diuji unit.)
- [x] Empat tab bawah: Pesanan (badge jumlah yang perlu ditindak), Item dan Laporan ("segera hadir"), Profil (info Lapak + Keluar).
- [x] Penanda offline + aksi tulis langsung gagal dengan pesan saat offline (dicek di emulator).
- [x] Review keamanan manual (skill `/security-review` butuh remote `origin`, belum ada): URL API wajib HTTPS di build rilis, pesan layar menunggu tidak lewat parameter URL, link WhatsApp/Telepon hanya untuk nomor berisi angka.
- [ ] Uji Pesanan Antar dan QRIS Pribadi di emulator setelah ada data uji (Lapak demo dengan antar aktif dan mode QRIS Pribadi).

### Tahap 1b — Push Notification

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

- [x] Daftar Item, tambah/ubah, harga, harga modal, stok, aktif/nonaktif. (Dicek di emulator 2026-10-12: tambah Item lengkap, ubah ke pre-order, ubah harga, toggle Habis; data dicek lewat API dan muncul di menu Pembeli web. Tidak ada hapus Item, sama dengan web.)
- [x] Varian Item (grup + opsi + selisih harga). (Dicek di emulator dan di server.)
- [ ] Foto Item dan foto Lapak (kamera/galeri, kompres, upload). (Foto Item dan foto sampul Lapak dari galeri **selesai** dan dicek di emulator. **Sisa**: tombol kamera belum dicoba karena emulator tanpa kamera.)
- [x] Buka/tutup Lapak + jadwal operasional. (Kartu status di atas tab Pesanan, layar Jadwal Operasional dari Profil dengan pemilih jam native. Dicek di emulator dan di server.)

## Tahap 4 — Laporan, Profil, Uang, Lainnya

> Keputusan User di Plan mode (2026-10-13): peta = WebView Leaflet + tile OSM, geocoding lewat endpoint baru di repo web; menu mengikuti web (Ulasan di Profil, tab Laporan hanya Penjualan); QR tagihan disimpan ke galeri untuk dipindai dari e-wallet; poster QR Menu dirender di HP; dikerjakan sebagai 4a/4b/4c dalam satu sesi.

- [x] **4a** Profil Lapak: ubah nama/pemilik/kategori, foto sampul, alamat + titik peta (cari alamat, geser peta, "Pakai lokasi saya", alamat terisi otomatis), rekening Pencairan. Endpoint `GET /places/search` dan `GET /places/reverse` dibuat dulu di repo web.
- [x] **4a** QR Menu: lihat poster, salin link, simpan ke galeri (PNG 3x), bagikan.
- [x] **4a** Pengaturan pengantaran (aktif, Ongkir, jangkauan km).
- [x] **4a** Event yang diikuti Gerai (kartu di Profil).
- [x] **4b** Laporan penjualan (Hari ini/7/30 hari, ringkasan, grafik omzet per hari, Item terlaris) + Rekomendasi Asisten (skill `dataviz`).
- [x] **4b** Rating & Ulasan Gerai.
- [x] **4c** Metode pembayaran (lihat saja) + unggah/ganti foto QRIS Pribadi; peringatan Lapak terkunci karena tagihan menunggak.
- [x] **4c** Tagihan Biaya Layanan: daftar, QR bayar (simpan ke galeri/bagikan), status diperbarui tiap 4 detik selama ada yang belum lunas.
- [ ] Riwayat Pencairan/Saldo Pedagang. **Ditunda** (keputusan User 2026-10-13): dashboard web Pedagang juga belum punya, dan belum ada endpoint. Dikerjakan di repo web dulu (dicatat di BACKLOG web), baru aplikasi.
- [ ] QR tagihan dari server berukuran kecil sehingga tampak buram saat diperbesar di HP (tetap terbaca). Opsional: server mengirim `qrString` atau PNG lebih besar supaya aplikasi bisa menggambar QR tajam.

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
