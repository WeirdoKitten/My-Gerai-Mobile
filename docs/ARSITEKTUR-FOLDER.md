# Arsitektur Folder

> Ini **target** struktur. Yang sudah ada per Tahap 1a (2026-10-12): `app/` (`_layout`, `index` redirect, `(auth)/{login,daftar,menunggu}`, `(tabs)/{pesanan,item,laporan,profil}`, `pesanan/[orderId]`, `dev/komponen`), `src/api/` (client, query-client, error-message, schemas + endpoints auth/me/orders/meta), `src/features/{auth,orders,products,lapak,profile,placeholder}/`, `app/item/{baru,[productId]}.tsx`, `app/jadwal.tsx` (Tahap 3), `src/components/ui/`, `src/lib/{auth,network,format}/`, `src/theme.ts`, `src/types/order-status.ts`, `tests/`. Perbarui dokumen ini setiap kali struktur nyata berubah.
>
> Catatan expo-router: rute sesudah login dibungkus `Stack.Protected` di `app/_layout.tsx`. Tab memakai `expo-router/js-tabs`. Folder tab berisi `index.tsx` (`(tabs)/pesanan/index.tsx`), sehingga URL tab `/pesanan` dan detail `/pesanan/[orderId]` (di luar tab) tidak bentrok.

```
/
├── CLAUDE.md                  # Instruksi utama Claude Code (dibaca tiap sesi)
├── README.md                  # Pengantar untuk manusia: prasyarat & cara menjalankan
├── CHANGELOG.md               # Riwayat perubahan dokumen & fitur besar
├── docs/                      # Ground truth khusus mobile (domain ada di ../My-Gerai/docs)
├── .claude/settings.json      # Izin Claude Code + akses baca ke ../My-Gerai
├── app.config.ts              # Konfigurasi Expo (nama, package, plugin, izin, env publik)
├── eas.json                   # Profil EAS Build: development, preview, production
├── pnpm-workspace.yaml        # pnpm 11: nodeLinker hoisted (wajib untuk Expo), allowBuilds, minimumReleaseAgeExclude
├── .env.example               # EXPO_PUBLIC_API_URL (salin ke .env, tidak di-commit)
├── jest.config.js             # preset jest-expo + alias @/
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
│   ├── pesanan/[orderId].tsx  # Detail Pesanan (target ketuk notifikasi)
│   └── dev/komponen.tsx       # Review visual komponen UI, hanya __DEV__ (redirect ke / di build rilis)
├── src/
│   ├── api/
│   │   ├── client.ts          # fetch + base URL + Bearer + timeout + pemetaan error (401 → logout lokal)
│   │   ├── query-client.ts    # QueryClient: retry GET hanya untuk gangguan sementara, mutation tanpa retry
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
│   └── types/                 # Tipe bersama yang tidak diturunkan dari skema Zod (mis. order-status.ts, salinan enum web)
├── assets/                    # Ikon aplikasi, splash, bunyi notifikasi, font lokal bila perlu
├── tests/                     # Jest + React Native Testing Library (unit & komponen)
└── .maestro/                  # Alur E2E Maestro (YAML)
```

## Aturan

- Layar di `app/` **tipis**: susun komponen dan panggil hook dari `src/features/`. Logika tidak ditulis langsung di file layar.
- Komponen yang dipakai di lebih dari satu fitur pindah ke `src/components/ui/` (kalau generik) atau tetap di fitur asalnya (kalau spesifik).
- Semua akses jaringan lewat `src/api/`. Komponen tidak memanggil `fetch` langsung.
- Nama folder rute boleh Bahasa Indonesia (`pesanan`, `daftar`) karena muncul sebagai path deep link yang dilihat pengguna, mengikuti pola repo web (`/dashboard/profil`). Identifier di dalam file tetap Bahasa Inggris.
