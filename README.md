# MyGerai Mobile

Aplikasi Android **khusus Pedagang** untuk platform **MyGerai** (pemesanan QR + QRIS untuk pedagang kecil). Pedagang bisa menerima Pesanan dengan notifikasi, mengubah status, mencetak struk ke printer Bluetooth, mengelola Item, dan melihat laporan.

Backend, database, dan aturan bisnis ada di repo web **[My-Gerai](https://github.com/WeirdoKitten/My-Gerai)**. Aplikasi ini hanya klien dari REST API `/api/mobile/v1/*` di sana.

> Status (2026-10-12): login, daftar, antrean Pesanan, ubah status, kelola Item, buka/tutup Lapak, dan jadwal sudah jalan. Push notification (Tahap 1b), cetak struk (Tahap 2), dan laporan/profil lengkap (Tahap 4) menyusul. Lihat [docs/BACKLOG.md](docs/BACKLOG.md).

## Struktur Repo Lokal

Kedua repo **wajib** di-clone bersebelahan, karena dokumen di sini merujuk dokumen domain di repo web lewat path relatif:

```
D:/Proyek Baru/
├── My-Gerai/          # repo web (backend + dokumen domain)
└── My-Gerai-Mobile/   # repo ini
```

```bash
git clone https://github.com/WeirdoKitten/My-Gerai.git
git clone https://github.com/WeirdoKitten/My-Gerai-Mobile.git
```

## Prasyarat

- Node.js LTS dan **pnpm**
- Android Studio (emulator) atau HP Android dengan mode developer
- Akun Expo (untuk EAS Build)
- Server repo web berjalan (lokal atau staging) sebagai API

## Menjalankan

Aplikasi memakai **development build**, bukan Expo Go, karena modul Bluetooth printer tidak tersedia di Expo Go.

```bash
pnpm install
cp .env.example .env   # isi EXPO_PUBLIC_API_URL (emulator: 10.0.2.2, HP fisik: lihat "HP fisik lewat USB")
```

Development build, pilih salah satu:

- **Lokal** (butuh Android Studio + SDK API 36, **JDK 17** di `JAVA_HOME`, `ANDROID_HOME` + `platform-tools` di PATH, dan long paths Windows aktif): nyalakan emulator atau colok HP via USB, lalu `pnpm android`. Perintah ini memasang development build lalu menjalankan Metro. Build pertama ±10–20 menit. JDK yang lebih baru (mis. 25) tidak dipakai untuk build ini.
- **EAS** (tanpa Android Studio): `npx eas-cli login`, `npx eas-cli init` (sekali), lalu `npx eas-cli build --profile development --platform android`. Pasang APK hasilnya di HP, lalu `pnpm start`.

Setelah development build terpasang, cukup `pnpm start` untuk pengembangan sehari-hari. Di build development, layar awal punya tombol **Lihat komponen UI** untuk review tampilan.

### HP fisik lewat USB

Persiapan sekali: aktifkan **Opsi pengembang** (ketuk Nomor versi 7×) lalu **Debugging USB**, colok kabel, dan pilih **Selalu izinkan** di dialog otorisasi. Cek dengan `adb devices` (status harus `device`, bukan `unauthorized`). `adb reverse` membuat `localhost` di HP diteruskan ke laptop, jadi tidak perlu IP LAN atau Wi‑Fi yang sama.

Pilih server API di `.env`:

| Server | `EXPO_PUBLIC_API_URL` | Catatan |
|---|---|---|
| Lokal (laptop) | `http://localhost:3000/api/mobile/v1` | Aman untuk uji coba, butuh `pnpm dev` di `../My-Gerai` dan `adb reverse tcp:3000`. Wajib kalau endpoint baru belum di-deploy. |
| Produksi (Garuda) | `https://mygerai.myplaza.my.id/api/mobile/v1` | Data asli: ubah status, Item, dan Pencairan langsung terlihat Pembeli. Pakai akun Pedagang khusus uji. |

Setelah mengganti `.env`, jalankan ulang Metro dengan `pnpm start --clear`.

Urutan sehari-hari:

1. Colok USB ke HP.
2. Kalau memakai server lokal: pastikan `pnpm dev` jalan di `../My-Gerai` (port 3000).
3. Di repo ini:
   ```bash
   adb reverse tcp:8081 tcp:8081   # Metro
   adb reverse tcp:3000 tcp:3000   # hanya untuk server lokal
   pnpm start
   ```
4. Opsional, tampilkan layar HP di laptop (bisa dikendalikan dengan mouse dan keyboard). Jalankan di terminal terpisah:
   ```bash
   scrcpy --stay-awake
   ```
   Pasang sekali dengan `winget install --exact Genymobile.scrcpy`. Ctrl+S untuk screenshot.
5. Buka aplikasi MyGerai di HP. Kalau muncul menu development build, ketuk server `localhost:8081`.

`adb reverse` hilang tiap kabel dicabut atau HP restart, jadi ulangi langkah 3 (dan 4 kalau memakai scrcpy). `pnpm android` hanya perlu lagi kalau ada perubahan native (library baru, `app.config.ts`, plugin).

Masalah yang pernah terjadi:

- **Layar putih setelah memilih server**: Metro macet. Hentikan Metro (Ctrl+C), jalankan `pnpm start --clear`, buka ulang aplikasi.
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE`** saat `pnpm android`: APK lama (mis. build EAS) beda tanda tangan. `adb uninstall com.mygerai.pedagang`, lalu ulangi.
- **`adb` tidak dikenali**: tambahkan `%LOCALAPPDATA%\Android\Sdk\platform-tools` ke PATH.

Perintah lain:

```bash
pnpm typecheck   # TypeScript strict
pnpm lint        # Biome (lint + format + urutan import)
pnpm format      # Biome, perbaiki otomatis
pnpm test        # Jest + React Native Testing Library
```

Server repo web harus berjalan supaya API bisa dipanggil. Di `../My-Gerai`: `pnpm db:migrate`, `pnpm db:seed:demo` (sekali), lalu `pnpm dev`. Akun Pedagang demo: `082222222222` / `password`. Pesanan uji dibuat dari halaman menu Pembeli di browser (`localhost:3000/menu/bakso-pak-budi`, tombol simulasi bayar).

## Dokumentasi

Mulai dari [CLAUDE.md](CLAUDE.md) (ringkasan + daftar dokumen), lalu [docs/RULES.md](docs/RULES.md).
