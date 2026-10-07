# Arsitektur Folder

> Ini **target** struktur. Saat ini repo baru berisi dokumen. Perbarui dokumen ini setiap kali struktur nyata berubah.

```
/
├── CLAUDE.md                  # Instruksi utama Claude Code (dibaca tiap sesi)
├── README.md                  # Pengantar untuk manusia: prasyarat & cara menjalankan
├── CHANGELOG.md               # Riwayat perubahan dokumen & fitur besar
├── docs/                      # Ground truth khusus mobile (domain ada di ../My-Gerai/docs)
├── .claude/settings.json      # Izin Claude Code + akses baca ke ../My-Gerai
├── app.config.ts              # Konfigurasi Expo (nama, package, plugin, izin, env publik)
├── eas.json                   # Profil EAS Build: development, preview, production
├── .npmrc                     # node-linker=hoisted (wajib untuk Expo + pnpm)
├── biome.json
├── tsconfig.json              # strict + alias @/ → src/
├── app/                       # Layar (expo-router, routing berbasis file)
│   ├── _layout.tsx            # Root: font, QueryClientProvider, AuthProvider, notifikasi
│   ├── (auth)/                # Belum login
│   │   ├── login.tsx
│   │   └── daftar/            # Pendaftaran Pedagang (beberapa langkah)
│   ├── (tabs)/                # Sudah login, tab bawah
│   │   ├── _layout.tsx
│   │   ├── pesanan/           # Antrean + riwayat Pesanan
│   │   ├── item/              # Kelola Item, varian, stok
│   │   ├── laporan/           # Laporan penjualan
│   │   └── profil/            # Profil, buka/tutup, jadwal, pengantaran, pembayaran, tagihan, ulasan, event, printer
│   └── pesanan/[orderId].tsx  # Detail Pesanan (target ketuk notifikasi)
├── src/
│   ├── api/
│   │   ├── client.ts          # fetch + base URL + Bearer + timeout + pemetaan error (401 → logout lokal)
│   │   ├── schemas/           # Skema Zod respons/permintaan per domain (orders.ts, products.ts, ...)
│   │   └── endpoints/         # Satu fungsi per endpoint, mengikuti kontrak API web
│   ├── features/<fitur>/      # Hook TanStack Query, komponen khusus fitur, logika tampilan
│   │                          #   contoh: features/orders/{useOrderQueue.ts, OrderCard.tsx}
│   ├── components/ui/         # Komponen UI baku (Button, Input, Card, Badge, ...) — lihat DESAIN-SISTEM
│   ├── lib/
│   │   ├── auth/              # Penyimpanan token (secure-store), AuthProvider
│   │   ├── notifications/     # Izin, channel Android, registrasi token push, handler ketuk
│   │   ├── printer/           # Scan/sambung BLE, kirim byte per potongan MTU
│   │   ├── receipt/           # Encoder ESC/POS (port dari repo web, harus identik)
│   │   └── format/            # Rupiah, tanggal/jam WIB, nomor HP
│   ├── theme.ts               # Token warna, tipografi, radius, spacing, bayangan
│   └── types/                 # Tipe bersama yang tidak diturunkan dari skema Zod
├── assets/                    # Ikon aplikasi, splash, bunyi notifikasi, font lokal bila perlu
├── tests/                     # Jest + React Native Testing Library (unit & komponen)
└── .maestro/                  # Alur E2E Maestro (YAML)
```

## Aturan

- Layar di `app/` **tipis**: susun komponen dan panggil hook dari `src/features/`. Logika tidak ditulis langsung di file layar.
- Komponen yang dipakai di lebih dari satu fitur pindah ke `src/components/ui/` (kalau generik) atau tetap di fitur asalnya (kalau spesifik).
- Semua akses jaringan lewat `src/api/`. Komponen tidak memanggil `fetch` langsung.
- Nama folder rute boleh Bahasa Indonesia (`pesanan`, `daftar`) karena muncul sebagai path deep link yang dilihat pengguna, mengikuti pola repo web (`/dashboard/profil`). Identifier di dalam file tetap Bahasa Inggris.
