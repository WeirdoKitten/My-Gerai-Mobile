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

- **Plus Jakarta Sans** bobot 400/500/600/700, plus 800 khusus `orderCode` (`@expo-google-fonts/plus-jakarta-sans`). Di React Native setiap bobot adalah `fontFamily` terpisah; pakai token, bukan `fontWeight`.
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
| `Card` | Border `line`, radius 16, padding 16. `elevated` = `shadow.card` tanpa border. `accent` = garis `brand` 5px di sisi kiri untuk hal yang butuh perhatian (Pesanan baru). |
| `Badge`, `OrderStatusBadge` | Warna status sama persis dengan web. `OrderStatusBadge` selalu memakai titik warna (`dot`) di depan label supaya terbaca sekali lirik. |
| `Alert` | Info/sukses/peringatan/error di dalam layar. |
| `Toast` | Umpan balik singkat setelah aksi. |
| `Modal` / `BottomSheet` | Konfirmasi dan pilihan. Aksi destruktif selalu konfirmasi. |
| `EmptyState` | Ilustrasi/ikon + kalimat ramah + aksi berikutnya. |
| `Spinner`, `Skeleton` | Skeleton untuk daftar saat pertama dimuat. |
| `StarRating`, `QuantityStepper`, `PhotoThumb` | Padanan web. |
| `ScreenHeader` | Padanan `PageHeader` web. Judul `title` + subjudul opsional + tombol kembali opsional. |
| `Screen` | Kerangka layar sesudah login: `ScreenHeader` + `OfflineBanner` di atas, isi mengisi sisa layar. |
| `SegmentedControl` | Dua sampai tiga pilihan setara (mis. Aktif / Riwayat). Wadah pill `surface` berborder, aktif `brandTint` + teks `brandStrong`. |
| `PasswordInput` | `Input` + tombol lihat/sembunyikan password. |
| `Toggle` | `Switch` bawaan Android (terasa native), track `brand` saat aktif, label wajib untuk pembaca layar. |
| `PhotoThumb` | `expo-image` dengan cache disk, radius `control`; tanpa foto = kotak `brandTint` + ikon. `dimmed` untuk Item Habis. |
| `MoneyInput` | `Input` keyboard angka yang hanya menerima digit. Pratinjau `Rp15.000` ditaruh di hint `Field`. |
| `ListRow` | Baris menu (ikon dalam kotak `brandTint`, judul, keterangan, chevron) untuk membuka layar lain. |
| `TimeField` | Tombol jam (`09.00`, tabular) yang membuka pemilih jam native 24 jam. |
| `OfflineBanner` | Penanda "Tidak ada koneksi" ([ARSITEKTUR-SISTEM §5](ARSITEKTUR-SISTEM.md#5-jaringan-lambat-dan-offline)). |
| `SubScreen` | Kerangka layar turunan (dibuka dari tab): `ScreenHeader` dengan tombol kembali, `OfflineBanner`, isi, dan `footer` opsional yang menempel di bawah untuk aksi utama. |
| `StarRating` | Lima bintang read-only (`star`/`star-outline`, `brand`/`line`), dibulatkan ke bintang utuh seperti web. |

## 4. Layout

- Safe area selalu dihormati (`react-native-safe-area-context`).
- Tab bawah: **Pesanan**, **Item**, **Laporan**, **Profil**. Tab Pesanan menampilkan jumlah Pesanan yang perlu diproses.
- Konten satu kolom, padding horizontal 16. Aksi utama di bawah layar (sticky) kalau layar panjang.
- Daftar memakai pull-to-refresh.
- Status bar terang dengan ikon gelap di atas `bg`.

## 5. Pola Spesifik

- **Kartu Pesanan baru**: paling menonjol di antrean, bergaya **tiket**: `Card elevated accent`, waktu masuk + `OrderStatusBadge` di atas, Kode Pesanan `orderCode`, nama Pembeli, lalu **sobekan tiket** (garis putus-putus `line` dengan coakan setengah lingkaran warna `bg` di kedua sisi), daftar Item (qty `brandStrong` tabular), total, dan satu tombol `lg` untuk aksi berikutnya. Ini satu-satunya elemen "berani" di aplikasi; komponen lain sengaja tenang. Contoh: `app/dev/komponen.tsx`.
- **Notifikasi**: bunyi khusus Pesanan, ikon notifikasi monokrom sesuai aturan Android.
- **Uang**: selalu `Rp12.000` (titik ribuan, tanpa desimal), tabular nums.
- **Kartu Pesanan di antrean** (Tahap 1a): aksen `brand` + `elevated` hanya untuk Pesanan yang perlu ditindak (`dibayar` atau QRIS Pribadi menunggu konfirmasi). Pesanan yang sedang diproses memakai kartu berborder biasa. Harga per baris Item dari server (qty × harga snapshot, sama dengan web); **tanpa total** karena `GET /orders` tidak membawanya. Catatan Item berwarna `warning` supaya tidak terlewat. Bagian atas kartu (kode, nama) membuka detail; tombol aksi tetap di kartu.
- **Riwayat**: kartu berborder read-only, kode `heading` dengan letter spacing, footer "Bagianmu" (`totalForMerchant`, untuk `selesai`) atau "Nilai Pesanan" (`subtotal`), nilai dari server.
- **Konfirmasi**: `Sheet` dari bawah untuk aksi uang atau yang tidak bisa dibatalkan (Tandai Lunas, Keluar, Gagal Diantar). Web tidak memakai konfirmasi untuk Tandai Lunas; di HP salah ketuk lebih mungkin.
- **Daftar Item** (Tahap 3): satu panel `surface` berborder berisi baris; foto 64 di kiri, nama + harga + badge (Pre-order, Stok N, Habis), `Toggle` Tersedia/Habis di kanan dengan label kecil berwarna `success` saat tersedia. Item Habis: foto dan nama diredupkan. Tombol "Tambah Item" `lg` menempel di bawah.
- **Form Item**: satu kolom, foto 96 + tombol galeri/kamera di atas, pre-order dalam panel berborder dengan `Toggle`, editor varian berupa panel per grup. Tombol "Simpan Item" menempel di bawah; error isian ditandai merah dan diringkas di atas tombol.
- **Status Lapak** (di atas tab Pesanan): panel berwarna `successBg`/`dangerBg` dengan border sewarna, titik status, "Lapak Buka/Tutup", keterangan (termasuk "Buka lagi … sesuai jadwal"), dan `Toggle`.
- **Kartu Lapak** (tab Profil, Tahap 4): kartu berborder dengan **tenda bergaris** di atas (garis `brand`/`brandTint` 24px + tepi bergelombang), foto Lapak 72, nama `title`, kategori, alamat, tombol "Ubah Profil" dan "QR Menu". Tenda ini hiasan kedua di aplikasi setelah tiket Pesanan, sengaja hanya di layar yang jarang dibuka. Di bawahnya satu panel `ListRow` (urutan sama dengan web: Jadwal, Metode Pembayaran, Pengantaran, Rating & Ulasan) dan kartu event kalau ada.
- **Form Ubah Profil**: foto sampul lebar 200, bagian berjudul `heading` (Info Lapak, Lokasi Lapak, Rekening Pencairan, Akun), tombol "Simpan Profil" menempel di bawah.
- **Pemilih lokasi**: kotak cari dengan ikon kaca pembesar, daftar saran dalam panel berborder, peta 240 berborder radius `card`, pin `map-marker` `brand` 44 di tengah (pudar kalau belum ada titik), tombol "Pakai lokasi saya" + "Hapus titik", keterangan status di bawah. Saat jari di peta, layar berhenti menggulir.
- **Laporan**: `SegmentedControl` periode, Omzet sebagai angka utama (40, proporsional) + perubahan vs periode lalu (panah + `success`/`danger`), stat tile 2 kolom (Keuntungan, Pesanan, Rata-rata, Ongkir), panel `neutralBg` "Ditagih ke Pembeli", Rekomendasi Asisten, grafik kolom omzet per hari, Item terlaris dengan bar `revenueShare`. Grafik: satu seri `brand`, kolom maks 24px ujung atas membulat 4px, grid garis rambut `line`, label sumbu ringkas (`50rb`), ketuk kolom untuk melihat angkanya (kolom terpilih `brandStrong` + latar `neutralBg`). Grafik disembunyikan kalau hanya satu hari.
- **Tagihan Biaya Layanan**: tagihan belum lunas = `Card elevated accent`, nominal 28 bold, jatuh tempo `warning`, QR dalam bingkai putih, tiga langkah bernomor, tombol "Simpan QR ke galeri" + "Bagikan QR". Tagihan lain kartu berborder dengan nominal lebih kecil.
- **QR Menu**: poster dari server di tengah (maks 360), baris link + "Salin", tombol "Simpan ke galeri" dan "Bagikan" menempel di bawah.
- **Layar sebelum login**: ikon Lapak dalam kotak `brandTint`, judul, satu kalimat penjelas, isian di tengah, tombol utama `lg` di bawah.

## 6. Ikon

Satu set: **`MaterialCommunityIcons`** dari `@expo/vector-icons` (dipilih Tahap 0, 2026-10-07: terasa native Android, varian `-outline` lengkap). Impor per keluarga (`@expo/vector-icons/MaterialCommunityIcons`). Ukuran 20/24. Warna dari token. Jangan mencampur keluarga lain.

## 7. Yang Dihindari

- Dark mode, gradien ramai, animasi mencolok (hormati pengaturan "kurangi animasi").
- Teks kecil di bawah 12, teks abu di atas latar abu.
- Ikon tanpa label untuk aksi penting.
- Tampilan generik template tanpa disesuaikan dengan token.

## 8. Status Implementasi

Tahap 0 (2026-10-07): `src/theme.ts` (semua token di atas + `onBrand` putih untuk teks di atas tombol berwarna), `Button`, `Input` (termasuk `multiline` sebagai Textarea), `Field`, `Card`, `Badge`, `OrderStatusBadge`, `Alert`, `Spinner` di `src/components/ui/`. Review visual di `app/dev/komponen.tsx` (hanya build development). Dicek di emulator Android API 37 (2026-10-08); belum dicek di HP fisik. Tahap 1a (2026-10-12) menambah `Toast`, `Sheet`, `EmptyState`, `ScreenHeader`, `Screen`, `SegmentedControl`, `OfflineBanner`, `PasswordInput`, dan varian `Button` `dangerOutline`; semua layar Tahap 1a dicek di emulator, termasuk skala huruf 1.3×. Tahap 3 (2026-10-12) menambah `PhotoThumb`, `MoneyInput`, `ListRow`, `TimeField`, `Toggle`. Tahap 4 (2026-10-13) menambah `SubScreen`, `StarRating`, pola §5 untuk Profil, Laporan, Tagihan, dan QR Menu; dicek di emulator termasuk skala huruf 1.3×. Komponen lain di §3 dibuat saat dibutuhkan fitur.
