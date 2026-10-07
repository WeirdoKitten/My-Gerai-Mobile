# Aturan Penulisan Kode

> Mengikuti [CODING-STYLE repo web](../../My-Gerai/docs/CODING-STYLE.md) sebisa mungkin, supaya kode web dan aplikasi terasa satu proyek. Di bawah ini ringkasan plus aturan khusus React Native.

## Bahasa dalam Kode

- Identifier: **Bahasa Inggris**.
- Komentar: default **tidak ada**. Kalau perlu (alasan tidak jelas, workaround, batasan perangkat), tulis singkat dalam **Bahasa Indonesia**.
- Teks yang dilihat Pedagang: **Bahasa Indonesia**, istilah baku [GLOSSARY web](../../My-Gerai/docs/GLOSSARY.md).
- Log internal: boleh Bahasa Inggris. Jangan pernah mencatat token, password, atau data Pembeli.

## Pemetaan Istilah Domain

Pakai tabel di [CODING-STYLE web §Pemetaan Istilah Domain](../../My-Gerai/docs/CODING-STYLE.md#pemetaan-istilah-domain) (contoh: Pedagang = `Merchant`, Item = `Product`, Pesanan = `Order`, Biaya Layanan = `platformFee`, Pencairan = `Payout`). **Jangan membuat nama berbeda** untuk konsep yang sama. Nama field respons API dipakai apa adanya.

## Konvensi Penamaan

- Variabel & fungsi: `camelCase`. Komponen & tipe: `PascalCase`.
- File komponen: `PascalCase.tsx`. File non-komponen: `kebab-case.ts`. File layar expo-router mengikuti nama rute (`login.tsx`, `[orderId].tsx`).
- Hook: `useXxx` (contoh: `useOrderQueue`). Kunci TanStack Query sebagai array konstan per fitur (contoh: `orderKeys.queue()`), bukan string tersebar.
- Konstanta: `UPPER_SNAKE_CASE`.

## TypeScript

- `strict: true`, tanpa pengecualian tanpa diskusi.
- Hindari `any`. Data dari luar (respons API, AsyncStorage, payload notifikasi) bertipe `unknown` sampai lolos Zod.
- Tipe respons diturunkan dari skema Zod (`z.infer`) di `src/api/schemas/`, tidak ditulis ulang manual.

## React Native

- Styling: `StyleSheet.create` di bawah komponen, nilai **hanya** dari `src/theme.ts`. Warna/ukuran arbitrer di dalam komponen dilarang (lihat [DESAIN-SISTEM.md](DESAIN-SISTEM.md)).
- Daftar panjang memakai `FlatList`/`SectionList`, tidak `ScrollView` + `map`.
- Kode khusus platform (`Platform.OS`) seminimal mungkin. Aplikasi ini Android saja.
- Efek samping perangkat (BLE, notifikasi, secure store) dibungkus di `src/lib/`, tidak dipanggil langsung dari layar. Ini juga memudahkan mock di test.

## Validasi

- Form: Zod di klien untuk pesan cepat. **Server tetap memvalidasi ulang**; pesan error server ditampilkan apa adanya kalau ramah pengguna.
- Respons API: divalidasi Zod di `src/api/endpoints/`. Gagal validasi = bug kontrak → fail loud (laporkan, tampilkan pesan umum), jangan diam-diam.

## Commit Message

- [Conventional Commits](https://www.conventionalcommits.org/) dengan deskripsi **Bahasa Indonesia**. Contoh: `feat: tambah layar antrean Pesanan`, `fix: perbaiki potongan data BLE untuk printer 58mm`.
- Perubahan `docs/` disebut eksplisit, tidak disembunyikan di commit fitur yang tidak terkait.

## Import Order

(1) modul eksternal (`react`, `react-native`, `expo-*`) → (2) alias internal (`@/api`, `@/lib`, `@/components`) → (3) relatif. Diterapkan lewat Biome saat scaffolding.
