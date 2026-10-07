# CLAUDE.md — Instruksi Proyek MyGerai Mobile (Aplikasi Android Pedagang)

Dokumen ini otomatis dibaca setiap sesi Claude Code di repo ini. Tujuannya: **konsistensi**, walau User berpindah-pindah room/chat.

## Apa Proyek Ini

**MyGerai Mobile** adalah aplikasi Android **khusus Pedagang** untuk platform **MyGerai** (sistem pemesanan QR + QRIS untuk pedagang kecil). Fitur v1 **setara dashboard web Pedagang**: daftar, login, antrean Pesanan + ubah status, push notification saat Pesanan lunas, cetak struk Bluetooth, kelola Item, laporan, profil, pencairan, tagihan, ulasan, event.

- **Backend tidak ada di repo ini.** Server, database, pembayaran, dan aturan bisnis ada di repo web **MyGerai** ([WeirdoKitten/My-Gerai](https://github.com/WeirdoKitten/My-Gerai)), yang di-clone bersebelahan di `../My-Gerai`. Aplikasi ini hanya klien dari REST API `/api/mobile/v1/*` di repo web.
- Pembeli dan Admin **tidak** memakai aplikasi ini. Mereka tetap lewat web.

Status saat ini: **fondasi dokumentasi** (2026-10-07). Belum ada kode. Langkah berikutnya: Fase 12a (API mobile, di repo web) dan Tahap 0 scaffolding Expo (repo ini). Lihat [docs/BACKLOG.md](docs/BACKLOG.md) & [CHANGELOG.md](CHANGELOG.md).

## Ground Truth — Dua Tempat, Satu Sumber per Topik

**Dokumen khusus mobile** ada di `docs/` repo ini. **Dokumen domain** (aturan bisnis, data, istilah, kontrak API) **hanya** ada di repo web dan **tidak disalin** ke sini. Jangan mengandalkan ingatan dari sesi chat lain yang tidak tercatat.

### Dokumen repo ini

| Dokumen | Isi | Baca kalau... |
|---|---|---|
| [docs/RULES.md](docs/RULES.md) | Aturan tertinggi repo mobile | Selalu, di awal sesi |
| [docs/TEKNOLOGI.md](docs/TEKNOLOGI.md) | Stack mobile, versi, alasan | Menambah library/dependency/layanan |
| [docs/ARSITEKTUR-SISTEM.md](docs/ARSITEKTUR-SISTEM.md) | Alur aplikasi ↔ API, auth token, push, cetak struk, jaringan lambat, ADR mobile | Menyentuh API, auth, notifikasi, printer |
| [docs/ARSITEKTUR-FOLDER.md](docs/ARSITEKTUR-FOLDER.md) | Struktur folder target | Menambah file/folder |
| [docs/DESAIN-SISTEM.md](docs/DESAIN-SISTEM.md) | Token tema, komponen UI baku, aturan layout mobile | Menyentuh tampilan apa pun |
| [docs/CODING-STYLE.md](docs/CODING-STYLE.md) | Konvensi kode TypeScript/React Native | Menulis kode apa pun |
| [docs/BEST-PRACTICES.md](docs/BEST-PRACTICES.md) | Performa HP murah, keamanan, error, izin Android, testing, rilis | Menulis kode fitur apa pun |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Daftar task per tahap | Menentukan kerja berikutnya |
| [docs/CLAUDE-SKILLS.md](docs/CLAUDE-SKILLS.md) | Skill Claude Code wajib/disarankan | Merencanakan alur kerja task |
| [docs/DOKUMENTASI.md](docs/DOKUMENTASI.md) | Kapan update dokumen apa, aturan lintas repo | Selesai mengerjakan sesuatu |
| [docs/PROMPT-TIPS.md](docs/PROMPT-TIPS.md) | Tips User menulis prompt | Paham ekspektasi kolaborasi |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan dokumen & fitur besar repo ini | Ingin tahu histori keputusan |

### Dokumen domain (repo web, `../My-Gerai/docs/`)

| Dokumen | Baca kalau... |
|---|---|
| [../My-Gerai/docs/PRD.md](../My-Gerai/docs/PRD.md) | Mengerjakan fitur apa pun (alur Pedagang, aturan bisnis) |
| [../My-Gerai/docs/GLOSSARY.md](../My-Gerai/docs/GLOSSARY.md) | Ragu istilah. Teks UI wajib memakai istilah baku dari sini |
| [../My-Gerai/docs/DATA-MODEL.md](../My-Gerai/docs/DATA-MODEL.md) | Perlu paham bentuk data (status Pesanan, Item, varian, dll) |
| [../My-Gerai/docs/ARSITEKTUR-SISTEM.md](../My-Gerai/docs/ARSITEKTUR-SISTEM.md) | Perlu paham keputusan backend (ADR 2026-10-07 = keputusan aplikasi ini) |
| [../My-Gerai/docs/DESAIN-SISTEM.md](../My-Gerai/docs/DESAIN-SISTEM.md) | Sumber token warna/tipografi web yang diturunkan ke tema mobile |
| [../My-Gerai/docs/BACKLOG.md](../My-Gerai/docs/BACKLOG.md) | Status Fase 12a (endpoint API yang sudah tersedia) |
| Kontrak API mobile (dibuat di Fase 12a, lokasinya dicatat di sini setelah ada) | Memanggil endpoint apa pun |

Kalau `../My-Gerai` tidak ada, **berhenti dan minta User meng-clone** repo web bersebelahan. Jangan menebak aturan bisnis.

## ATURAN PALING PENTING (ringkasan — detail di [docs/RULES.md](docs/RULES.md))

1. **Bahasa Indonesia yang baik dan benar** untuk komunikasi, dokumentasi, teks UI, dan pesan commit. Identifier kode tetap Bahasa Inggris.
2. **Jangan berasumsi.** Ambigu soal uang, data, atau UX Pedagang → tanya User dengan opsi konkret.
3. **Aturan bisnis milik server.** Aplikasi tidak pernah menghitung uang final, menentukan status, atau memutuskan izin sendiri. Server di repo web selalu jadi otoritas.
4. **Perubahan domain dimulai di repo web.** Fitur atau aturan bisnis baru: catat dan putuskan di dokumen repo web dulu, baru diimplementasikan di sini.
5. **Paritas dengan web.** Fitur Pedagang baru dicatat di BACKLOG kedua repo supaya web dan aplikasi tidak saling tertinggal tanpa disadari.
6. **Desain UI wajib lewat skill `/frontend-design:frontend-design`** setiap membuat atau merombak layar/komponen, tetap dalam batas token [docs/DESAIN-SISTEM.md](docs/DESAIN-SISTEM.md). Target: tampilan yang sangat bagus, bukan sekadar jalan.
7. **Tidak ada rahasia di dalam aplikasi.** APK bisa dibongkar. Token login disimpan di `expo-secure-store`, bukan AsyncStorage.
8. **Sederhana, cepat, ringan.** Target HP Android murah dan jaringan lambat. Hindari over-engineering.
9. **`/security-review` wajib** untuk kode auth/token, push, dan apa pun yang menampilkan atau mengirim data uang.
10. **Jangan tandai selesai tanpa verifikasi nyata** di emulator atau HP Android (development build), bukan hanya membaca kode.

## Istilah Kunci (lengkap di [../My-Gerai/docs/GLOSSARY.md](../My-Gerai/docs/GLOSSARY.md))

**Pedagang/Lapak/Gerai** = penjual (pengguna aplikasi ini) · **Pembeli** = customer tanpa akun · **Item** = produk/menu · **Pesanan** = order · **Biaya Layanan** = fee platform per transaksi · **Pencairan** = transfer Saldo ke Pedagang · **QRIS Pribadi** = mode bayar langsung ke QRIS Pedagang · **Event Organizer (EO)** = klien pembuat event berisi banyak Gerai.

## Stack Ringkas (detail di [docs/TEKNOLOGI.md](docs/TEKNOLOGI.md))

React Native + **Expo** (SDK 57, development build) + TypeScript strict + expo-router + TanStack Query + Zod + StyleSheet dengan token tema + expo-secure-store + expo-notifications (FCM) + react-native-ble-plx (printer thermal) + Biome + Jest/RNTL + Maestro + EAS Build/Submit + pnpm (`node-linker=hoisted`).

## Alur Kerja Default untuk Task Apa Pun

1. Cek [docs/BACKLOG.md](docs/BACKLOG.md). Belum tercatat → catat dulu (cek juga BACKLOG repo web).
2. Baca dokumen relevan dari kedua tabel di atas.
3. Ambigu → tanya User.
4. Fitur besar → Plan mode dulu.
5. Endpoint yang dibutuhkan belum ada → kerjakan dulu di repo web (Fase 12a), jangan memalsukan data di aplikasi.
6. UI → `/frontend-design:frontend-design`.
7. Implementasi sesuai [docs/CODING-STYLE.md](docs/CODING-STYLE.md) & [docs/BEST-PRACTICES.md](docs/BEST-PRACTICES.md).
8. Verifikasi di emulator/HP, `/security-review` kalau relevan.
9. Update dokumen + [CHANGELOG.md](CHANGELOG.md) + centang BACKLOG (repo ini dan repo web kalau terkait).

Detail alur & skill di [docs/CLAUDE-SKILLS.md](docs/CLAUDE-SKILLS.md).
