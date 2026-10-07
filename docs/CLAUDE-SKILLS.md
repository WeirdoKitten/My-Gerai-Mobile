# Aturan Pemakaian Skill Claude Code

> Kapan memakai skill/tool Claude Code apa di repo ini, supaya kualitas konsisten tanpa User harus mengingatkan.

## Wajib Dipakai

- **`/frontend-design:frontend-design`**: **setiap** membuat layar baru, komponen UI baru, atau merombak tampilan yang ada (termasuk ikon aplikasi, splash, dan screenshot Play Store). Permintaan User 2026-10-07: desain UI harus **sangat bagus**, bukan sekadar berfungsi. Saat memanggil skill, sertakan konteks: token dan komponen di [DESAIN-SISTEM.md](DESAIN-SISTEM.md), pengguna (Pedagang di lapak ramai, HP murah, layar dilihat sekilas), dan bahwa hasilnya React Native `StyleSheet`, bukan HTML/CSS. Hasil skill **tidak boleh** keluar dari token; kalau butuh token/pola baru, usulkan ke User dan catat di DESAIN-SISTEM dulu.
- **`/security-review`**: setelah mengerjakan auth/token, logout, push notification, deep link, penyimpanan lokal, atau layar yang menampilkan/mengirim data uang ([RULES.md §7](RULES.md#7-keamanan)).
- **Plan mode / agent `Plan`**: untuk fitur besar atau yang menyentuh banyak file/dokumen, sebelum menulis kode.

## Direkomendasikan

- **`/code-review`**: sebelum menganggap fitur selesai. Level `high` untuk perubahan biasa; pertimbangkan `ultra` untuk alur auth dan push.
- **`/simplify`**: setelah fitur berfungsi, sebelum final (KISS).
- **`dataviz`**: saat membangun layar Laporan (grafik, kartu angka).
- **`run`**: untuk menjalankan aplikasi dan melihat perubahan berjalan. Di repo ini artinya development build di emulator/HP (`pnpm expo start` + dev client), bukan browser.
- **Subagent `Explore`**: pencarian lintas file setelah kode membesar, termasuk mencari logika rujukan di `../My-Gerai/src` (contoh: encoder struk, aturan status Pesanan).
- **`update-config` / `fewer-permission-prompts`**: mengatur `.claude/settings.json` (izin perintah yang sering dipakai).

## Tidak Relevan untuk Repo Ini

- `claude-api`: aplikasi tidak memanggil LLM.
- Skill dokumen/slide (`docx`, `pptx`, `pdf`): kecuali User meminta file seperti itu.

## Alur Kerja per Task

1. Baca dokumen relevan ([CLAUDE.md](../CLAUDE.md), termasuk dokumen domain di repo web).
2. Fitur besar → Plan mode.
3. Endpoint belum ada → kerjakan di repo web dulu.
4. UI → `/frontend-design:frontend-design`.
5. Implementasi.
6. Uji: `tsc`, Biome, Jest, lalu coba di emulator/HP (dan Maestro kalau alurnya tercakup).
7. Menyentuh auth/push/uang/penyimpanan → `/security-review`.
8. `/code-review` → `/simplify`.
9. Update dokumen + [CHANGELOG.md](../CHANGELOG.md) + centang [BACKLOG.md](BACKLOG.md) (dan BACKLOG web kalau terkait).

## Skill Custom (`.claude/skills/`)

Belum dibuat. Kandidat setelah ada pola yang benar-benar berulang:
- **Menambah layar baru**: rute expo-router + hook TanStack Query + skema Zod + komponen + test + panggilan `/frontend-design:frontend-design`.
- **Menyesuaikan perubahan kontrak API**: cek perubahan di repo web, perbarui skema Zod dan endpoint, jalankan test.
- **Rilis**: urutan naik versi, build EAS, submit, catat CHANGELOG.

Buat hanya setelah polanya terbukti berulang minimal dua kali. Kalau dibuat, catat di bagian atas dokumen ini.
