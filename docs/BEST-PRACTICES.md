# Best Practices

## Performa

Target: HP Android murah (RAM 2–3 GB, CPU lambat), jaringan seluler lambat, dipakai seharian.

- Daftar memakai `FlatList` dengan `keyExtractor` stabil; komponen baris di-`memo` kalau daftar panjang. Jangan `ScrollView` + `map` untuk data yang bisa bertambah.
- Gambar lewat `expo-image` dengan ukuran sesuai tampilan. Foto dikompres di HP sebelum upload (sisi terpanjang ±1280px, JPEG/WebP kualitas ±0.7).
- Polling hanya saat layar terkait aktif dan aplikasi di depan (`refetchInterval` + `focusManager`/`AppState`). Di latar belakang, andalkan push.
- Jangan menambah library besar tanpa alasan; cek ukuran dan dampak ke waktu start. Catat di [TEKNOLOGI.md](TEKNOLOGI.md).
- Waktu buka aplikasi sampai antrean Pesanan terlihat dijaga singkat: muat font dan sesi secara paralel, tampilkan data cache dulu.
- Uji di emulator dengan profil HP murah atau HP murah sungguhan sebelum fitur dianggap selesai.

## Keamanan

- Aturan wajib di [RULES.md §7](RULES.md#7-keamanan).
- Token hanya di `expo-secure-store`. Logout dan refresh gagal → hapus token **dan** `queryClient.clear()`.
- Jangan percaya data dari payload notifikasi; pakai hanya ID, lalu ambil detail dari API.
- Deep link (ketuk notifikasi) tidak boleh melewati pengecekan login.
- Jangan mencatat (log) respons API utuh di build produksi.

## Error Handling

- **Fail loud untuk bug**: respons API tidak sesuai skema Zod, state mustahil → laporkan (nanti ke Sentry), tampilkan pesan umum.
- **Fail ramah untuk kondisi wajar**: offline, timeout, printer mati, izin ditolak → pesan Bahasa Indonesia yang jelas + langkah berikutnya ("Nyalakan Bluetooth lalu coba lagi").
- Pemetaan error dilakukan sekali di `src/api/client.ts` (offline, timeout, 401, 403, 404, 409, 422, 5xx), bukan di setiap layar.
- Pasang Error Boundary di root agar crash satu layar tidak membuat aplikasi tertutup tanpa pesan.

## Izin Android

- **Notifikasi (Android 13+)**: minta izin setelah login dengan penjelasan singkat kenapa perlu ("supaya Pesanan baru terdengar walau HP terkunci"). Ditolak → banner di tab Pesanan dengan tombol ke Pengaturan.
- **Bluetooth (Android 12+)**: `BLUETOOTH_SCAN` dan `BLUETOOTH_CONNECT`, diminta saat Pedagang pertama kali menyiapkan printer, bukan saat aplikasi dibuka.
- **Kamera/galeri**: diminta saat memilih foto.
- Jangan meminta izin yang tidak dipakai. Setiap izin baru dicatat di [TEKNOLOGI.md](TEKNOLOGI.md) dan dijelaskan di kebijakan privasi.
- Penghemat baterai agresif di beberapa merek (Xiaomi, Oppo, Vivo) bisa menahan notifikasi. Sediakan panduan singkat di Profil untuk mengecualikan aplikasi dari penghemat baterai.

## Testing

- **Unit (Jest)** wajib untuk: encoder struk ESC/POS (hasil byte dibandingkan dengan contoh dari web), format Rupiah/tanggal, logika refresh token di klien API, skema Zod.
- **Komponen (React Native Testing Library)** untuk komponen UI baku dan kartu Pesanan.
- **E2E (Maestro)** minimal: login → antrean Pesanan → ubah status sampai selesai. Dijalankan ke server staging/dev dengan data seed repo web.
- **Manual di HP nyata** untuk push (aplikasi tertutup dan HP terkunci) dan printer BLE. Ini tidak bisa diganti emulator.

## Aksesibilitas Praktis

- Area sentuh minimal 48dp, kontras cukup, teks mengikuti skala huruf sistem.
- Setiap tombol ikon punya `accessibilityLabel` Bahasa Indonesia.
- Status tidak hanya dibedakan dengan warna; selalu ada teks.

## Rilis

- `versionCode` naik setiap rilis Play Store (biarkan EAS mengelola otomatis lewat `autoIncrement`). `version` mengikuti SemVer.
- Rilis lewat jalur uji tertutup dulu, baru produksi.
- Setiap rilis dicatat di [CHANGELOG.md](../CHANGELOG.md) dengan versi dan ringkasan untuk Pedagang.
- Perubahan yang butuh endpoint baru: rilis server (repo web) **lebih dulu**. Server harus tetap kompatibel dengan versi aplikasi lama yang masih terpasang (Pedagang tidak selalu update). Kalau terpaksa memutus kompatibilitas, pakai mekanisme "versi minimum" dari server (ditetapkan di Fase 12a).

## Internasionalisasi

Tidak diperlukan. Bahasa Indonesia saja, tanpa library i18n.
