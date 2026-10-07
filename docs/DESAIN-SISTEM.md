# Desain Sistem — Aplikasi Android Pedagang

> Ground truth tampilan aplikasi. Diturunkan dari [DESAIN-SISTEM repo web](../../My-Gerai/docs/DESAIN-SISTEM.md) supaya aplikasi dan web terasa **satu produk**: hangat, rapi, sederhana. Prinsip, warna, dan aturan teks UI mengikuti web; bagian di bawah menerjemahkannya ke React Native.
>
> **Setiap layar atau komponen baru/dirombak wajib dirancang lewat skill `/frontend-design:frontend-design`** ([CLAUDE-SKILLS.md](CLAUDE-SKILLS.md)), dalam batas token di sini. Pola baru yang belum ada → tambahkan dulu ke dokumen ini (+ [CHANGELOG.md](../CHANGELOG.md)) sebelum dipakai di banyak layar.

## 1. Prinsip

1. **Ikuti prinsip web §1**: hangat dan menggugah selera, sederhana sebelum cantik, terang saja (tanpa dark mode), konsisten lewat komponen, teks UI umum dan mudah dimengerti.
2. **Dipakai sambil bekerja.** Pedagang melirik HP di sela melayani Pembeli, sering dengan tangan sibuk dan di bawah matahari. Informasi terpenting (Pesanan baru, status, total) harus terbaca dalam sekali lirik.
3. **Satu aksi utama per layar.** Tombol utama besar dan mudah dijangkau ibu jari (bagian bawah layar).
4. **Terasa native Android.** Navigasi tab bawah, tombol kembali Android bekerja seperti seharusnya, umpan balik sentuh (ripple), tapi tetap memakai warna dan bentuk MyGerai.
5. **Bagus, bukan generik.** Hindari tampilan template bawaan. Hierarki, spacing, dan detail kecil (status, angka, foto Item) dirancang dengan sengaja.

## 2. Token (`src/theme.ts`)

### Warna (identik dengan web)

| Token | Hex | Dipakai untuk |
|---|---|---|
| `bg` | `#FAF6F1` | Latar layar |
| `surface` | `#FFFFFF` | Kartu, panel, input, tab bar |
| `ink` | `#1C1917` | Teks utama |
| `inkMuted` | `#78716C` | Teks sekunder |
| `line` | `#EAE3DB` | Garis pemisah, border |
| `brand` | `#EA580C` | Aksen besar, ikon, border aktif (bukan teks paragraf) |
| `brandStrong` | `#C2410C` | Tombol utama, link, teks kecil beraksen |
| `brandStrongPressed` | `#9A3412` | Tombol utama saat ditekan |
| `brandTint` | `#FFF1E7` | Latar aktif/terpilih, callout lembut |
| `success` / `successBg` | `#15803D` / `#F0FDF4` | Status sukses, "siap diambil" |
| `warning` / `warningBg` | `#B45309` / `#FEF3C7` | "Menunggu pembayaran" |
| `danger` / `dangerPressed` / `dangerBg` | `#DC2626` / `#B91C1C` / `#FEF2F2` | Error, dibatalkan, hapus |
| `info` / `infoBg` | `#1D4ED8` / `#EFF6FF` | "Dibayar", "diproses" |
| `neutralBg` | `#F4F1EC` | Badge netral |

Hitam murni, abu polos di luar token, dan warna sekali pakai **dilarang**. Kalau token web berubah, ubah juga tabel ini dan `theme.ts`.

### Tipografi

- **Plus Jakarta Sans** bobot 400/500/600/700 (`@expo-google-fonts/plus-jakarta-sans`). Di React Native setiap bobot adalah `fontFamily` terpisah; pakai token, bukan `fontWeight`.
- Ukuran dasar **16** (sedikit lebih besar daripada web 15px karena dibaca sambil bekerja). Hormati pengaturan ukuran huruf sistem (`allowFontScaling` tetap aktif); uji di skala 1.3×.

| Token | Ukuran / tinggi baris | Bobot | Dipakai |
|---|---|---|---|
| `title` | 22 / 28 | bold | Judul layar |
| `heading` | 18 / 24 | semibold | Judul bagian |
| `body` | 16 / 24 | regular | Teks isi |
| `bodyStrong` | 16 / 24 | semibold | Nama Item, nama Pembeli |
| `caption` | 14 / 20 | regular, `inkMuted` | Keterangan |
| `micro` | 12 / 16 | medium, `inkMuted` | Waktu, hint |
| `orderCode` | 28 / 34 | extrabold, letter spacing lebar | Kode Pesanan |
| `amount` | sesuai konteks | semibold + `fontVariant: ['tabular-nums']` | Harga, total, qty |

### Bentuk, spacing, elevasi

| Token | Nilai | Dipakai |
|---|---|---|
| `radius.card` | 16 | Kartu, panel, sheet |
| `radius.control` | 12 | Tombol, input |
| `radius.pill` | 999 | Badge, chip |
| `space` | skala 4: 4, 8, 12, 16, 20, 24, 32 | Semua jarak. Padding layar horizontal 16 |
| `shadow.card` | elevation rendah + warna bayangan hangat | Hemat. Mayoritas kartu cukup border `line` |
| `touch.min` | **48** | Tinggi/lebar minimum area sentuh |

## 3. Komponen Baku (`src/components/ui/`)

Padanan komponen web. Dibangun sekali, dipakai ulang; jangan menyalin style panjang di layar.

| Komponen | Catatan |
|---|---|
| `Button` | Varian `primary`, `secondary`, `ghost`, `danger`; ukuran `md` (48) dan `lg` (56) untuk aksi utama. State `loading` (spinner + teks tetap), `disabled`. Ripple Android. |
| `Input`, `Textarea`, `Field` | `Field` = label + input + hint/error. Keyboard type sesuai isi (angka untuk harga, telepon untuk No. HP). |
| `Select` / `PillOption` | Pilihan sedikit → pill; banyak → bottom sheet. |
| `Toggle` | Buka/tutup Lapak, aktif/nonaktif Item. |
| `Card` | Border `line`, radius 16, padding 16. |
| `Badge`, `OrderStatusBadge` | Warna status sama persis dengan web. |
| `Alert` | Info/sukses/peringatan/error di dalam layar. |
| `Toast` | Umpan balik singkat setelah aksi. |
| `Modal` / `BottomSheet` | Konfirmasi dan pilihan. Aksi destruktif selalu konfirmasi. |
| `EmptyState` | Ilustrasi/ikon + kalimat ramah + aksi berikutnya. |
| `Spinner`, `Skeleton` | Skeleton untuk daftar saat pertama dimuat. |
| `StarRating`, `QuantityStepper`, `PhotoThumb` | Padanan web. |
| `ScreenHeader` | Padanan `PageHeader` web. |
| `OfflineBanner` | Penanda "Tidak ada koneksi" ([ARSITEKTUR-SISTEM §5](ARSITEKTUR-SISTEM.md#5-jaringan-lambat-dan-offline)). |

## 4. Layout

- Safe area selalu dihormati (`react-native-safe-area-context`).
- Tab bawah: **Pesanan**, **Item**, **Laporan**, **Profil**. Tab Pesanan menampilkan jumlah Pesanan yang perlu diproses.
- Konten satu kolom, padding horizontal 16. Aksi utama di bawah layar (sticky) kalau layar panjang.
- Daftar memakai pull-to-refresh.
- Status bar terang dengan ikon gelap di atas `bg`.

## 5. Pola Spesifik

- **Kartu Pesanan baru**: paling menonjol di antrean (aksen `brand`, Kode Pesanan besar, nama Pembeli, ringkasan Item, total, waktu). Aksi berikutnya (proses / siap / selesai) satu tombol besar.
- **Notifikasi**: bunyi khusus Pesanan, ikon notifikasi monokrom sesuai aturan Android.
- **Uang**: selalu `Rp12.000` (titik ribuan, tanpa desimal), tabular nums.

## 6. Ikon

Satu set dari `@expo/vector-icons` (pilih satu keluarga saat Tahap 0 dan catat di sini). Ukuran 20/24. Warna dari token.

## 7. Yang Dihindari

- Dark mode, gradien ramai, animasi mencolok (hormati pengaturan "kurangi animasi").
- Teks kecil di bawah 12, teks abu di atas latar abu.
- Ikon tanpa label untuk aksi penting.
- Tampilan generik template tanpa disesuaikan dengan token.

## 8. Status Implementasi

Belum ada kode. Token dan komponen dibuat di Tahap 0 ([BACKLOG.md](BACKLOG.md)).
