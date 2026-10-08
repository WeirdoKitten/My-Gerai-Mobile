# MyGerai Mobile

Aplikasi Android **khusus Pedagang** untuk platform **MyGerai** (pemesanan QR + QRIS untuk pedagang kecil). Pedagang bisa menerima Pesanan dengan notifikasi, mengubah status, mencetak struk ke printer Bluetooth, mengelola Item, dan melihat laporan.

Backend, database, dan aturan bisnis ada di repo web **[My-Gerai](https://github.com/WeirdoKitten/My-Gerai)**. Aplikasi ini hanya klien dari REST API `/api/mobile/v1/*` di sana.

> Status: **Tahap 0 scaffolding** (2026-10-07). Proyek Expo, tema, dan komponen UI baku sudah ada; belum ada fitur. Lihat [docs/BACKLOG.md](docs/BACKLOG.md).

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
cp .env.example .env   # isi EXPO_PUBLIC_API_URL (emulator: 10.0.2.2, HP fisik: IP LAN komputer)
```

Development build, pilih salah satu:

- **Lokal** (butuh Android Studio + SDK + emulator atau HP via USB): `pnpm android`. Perintah ini memasang development build lalu menjalankan Metro.
- **EAS** (tanpa Android Studio): `npx eas-cli login`, `npx eas-cli init` (sekali), lalu `npx eas-cli build --profile development --platform android`. Pasang APK hasilnya di HP, lalu `pnpm start`.

Setelah development build terpasang, cukup `pnpm start` untuk pengembangan sehari-hari. Di build development, layar awal punya tombol **Lihat komponen UI** untuk review tampilan.

Perintah lain:

```bash
pnpm typecheck   # TypeScript strict
pnpm lint        # Biome (lint + format + urutan import)
pnpm format      # Biome, perbaiki otomatis
pnpm test        # Jest + React Native Testing Library
```

Server repo web harus berjalan supaya API bisa dipanggil (`pnpm dev` di `../My-Gerai`).

## Dokumentasi

Mulai dari [CLAUDE.md](CLAUDE.md) (ringkasan + daftar dokumen), lalu [docs/RULES.md](docs/RULES.md).
