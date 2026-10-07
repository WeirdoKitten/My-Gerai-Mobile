# MyGerai Mobile

Aplikasi Android **khusus Pedagang** untuk platform **MyGerai** (pemesanan QR + QRIS untuk pedagang kecil). Pedagang bisa menerima Pesanan dengan notifikasi, mengubah status, mencetak struk ke printer Bluetooth, mengelola Item, dan melihat laporan.

Backend, database, dan aturan bisnis ada di repo web **[My-Gerai](https://github.com/WeirdoKitten/My-Gerai)**. Aplikasi ini hanya klien dari REST API `/api/mobile/v1/*` di sana.

> Status: **fondasi dokumentasi** (2026-10-07). Kode belum dimulai. Lihat [docs/BACKLOG.md](docs/BACKLOG.md).

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

Akan dilengkapi di Tahap 0 (scaffolding). Gambaran:

```bash
pnpm install
pnpm expo start        # dengan development build terpasang di emulator/HP
```

Aplikasi memakai **development build**, bukan Expo Go, karena modul Bluetooth printer tidak tersedia di Expo Go.

## Dokumentasi

Mulai dari [CLAUDE.md](CLAUDE.md) (ringkasan + daftar dokumen), lalu [docs/RULES.md](docs/RULES.md).
