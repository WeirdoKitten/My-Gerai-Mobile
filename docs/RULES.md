# RULES — Aturan Pengembangan MyGerai Mobile

> Aturan tertinggi di repo ini. Turunan dari [RULES repo web](../../My-Gerai/docs/RULES.md), ditambah aturan khusus aplikasi Android. Kalau instruksi di chat bertentangan dengan dokumen ini, **tanya User dulu**.

## 1. Bahasa

1.1. Komunikasi dengan User, dokumentasi, pesan commit, dan **semua teks yang tampil di aplikasi** memakai **Bahasa Indonesia yang baik dan benar**.

1.2. Kode (variabel, fungsi, komponen, file) memakai **Bahasa Inggris**. Pemetaan istilah ada di [CODING-STYLE.md](CODING-STYLE.md#pemetaan-istilah-domain).

1.3. Istilah domain (Pedagang, Lapak, Pesanan, Item, dst) **wajib** mengikuti [GLOSSARY repo web](../../My-Gerai/docs/GLOSSARY.md). Teks UI mengikuti aturan teks di [DESAIN-SISTEM web §1](../../My-Gerai/docs/DESAIN-SISTEM.md) (tanpa "mis.", tanpa tanda pisah kecuali kata ulang).

## 2. Jangan Berasumsi

2.1. Requirement, keputusan bisnis, atau detail teknis yang ambigu → **tanya User** dengan opsi konkret, jangan menebak.

2.2. Terutama untuk hal yang mahal dibalik: uang, struktur data, alur Pedagang yang mendasar, izin Android, dan apa pun yang memengaruhi rilis Play Store.

## 3. Ground Truth

3.1. Ground truth tersebar di **dua repo, satu sumber per topik**:
- **Repo ini (`docs/`)**: teknologi mobile, arsitektur aplikasi, folder, desain sistem mobile, aturan, backlog aplikasi.
- **Repo web (`../My-Gerai/docs/`)**: PRD, aturan bisnis, data model, glossary, kontrak API, keputusan backend.

3.2. **Jangan menyalin** isi dokumen domain ke repo ini. Tautkan. Salinan akan berbeda isi seiring waktu.

3.3. Fitur baru atau aturan bisnis baru **dimulai di repo web**: dicatat di PRD/BACKLOG web, endpoint dibuat di sana, baru aplikasi mengikuti.

3.4. Setelah perubahan berdampak, dokumen terkait **wajib** diperbarui di commit yang sama dan dicatat di [CHANGELOG.md](../CHANGELOG.md). Perubahan signifikan dikonfirmasi User dulu.

## 4. Prioritas Desain

4.1. **Sederhana dulu (KISS).** Skala pedagang kaki lima, bukan enterprise.

4.2. **Cepat & ringan.** Target HP Android murah (RAM 2–3 GB) dan jaringan seluler lambat. Lihat [BEST-PRACTICES.md §Performa](BEST-PRACTICES.md#performa).

4.3. **UI harus sangat bagus.** Setiap layar/komponen baru atau yang dirombak **wajib** dirancang lewat skill `/frontend-design:frontend-design`, dalam batas token di [DESAIN-SISTEM.md](DESAIN-SISTEM.md). Pedagang memakai aplikasi ini berjam-jam di lapak yang ramai: jelas, besar, dan mudah diketuk lebih penting daripada dekorasi.

4.4. **Hanya Android** untuk saat ini. Jangan menambah kerja khusus iOS tanpa persetujuan User (Expo memudahkan iOS nanti, tapi itu keputusan terpisah).

## 5. Alur Kerja Fitur

5.1. Fitur baru tercatat dulu di [BACKLOG.md](BACKLOG.md) (dan di BACKLOG repo web kalau menyangkut domain/API).

5.2. Fitur besar → Plan mode dulu.

5.3. Butuh endpoint yang belum ada → buat di repo web dulu. **Dilarang** memakai data palsu atau hardcode untuk "sementara jalan" di kode yang di-commit.

5.4. **Paritas web**: fitur Pedagang yang ditambah di web atau aplikasi dicatat di BACKLOG keduanya, walau dikerjakan belakangan.

## 6. Uang & Aturan Bisnis

6.1. **Server adalah otoritas.** Aplikasi tidak menghitung total final, Biaya Layanan, ongkir, saldo, atau status Pesanan sendiri. Aplikasi hanya menampilkan nilai dari API.

6.2. Format uang selalu Rupiah dari bilangan bulat yang dikirim server. Jangan memakai float untuk uang.

6.3. Aksi yang mengubah status atau uang selalu menunggu konfirmasi server sebelum UI dianggap berhasil. Optimistic update hanya boleh untuk hal yang aman dibatalkan, dan wajib di-rollback saat gagal.

## 7. Keamanan

7.1. **Tidak ada rahasia di dalam aplikasi.** APK bisa dibongkar. Tidak boleh ada server key Midtrans, kredensial DB, atau secret apa pun di kode atau `app.config.ts`. Yang boleh: URL API publik dan ID publik (misalnya project ID Expo).

7.2. Token login (access + refresh) **hanya** disimpan di `expo-secure-store`. Dilarang di AsyncStorage, log, atau pesan error.

7.3. Semua komunikasi ke API lewat **HTTPS**. Tidak ada `usesCleartextTraffic` di build produksi.

7.4. File rahasia build (`*.keystore`, `*.jks`, `google-services.json`, `credentials.json`, `.env*`) **tidak di-commit**. Simpan lewat EAS Secrets / EAS credentials.

7.5. Isolasi data antar Pedagang dijamin server. Aplikasi tetap tidak boleh menyimpan data Pedagang lain atau menampilkan data dari sesi sebelumnya setelah logout (bersihkan cache query saat logout).

7.6. Push notification tidak boleh memuat data sensitif (No. HP Pembeli, alamat). Cukup ringkasan dan ID Pesanan; detail diambil lewat API setelah login.

## 8. Kualitas Kerja Claude

8.1. Jangan tandai selesai tanpa verifikasi nyata: `tsc` + lint + test lulus, **dan** fitur dicoba di emulator atau HP Android lewat development build.

8.2. Ragu → cek dokumen (repo ini dan repo web), jangan menebak dari ingatan.

8.3. Koreksi atau preferensi User yang berlaku jangka panjang → pertimbangkan dicatat sebagai memori.
