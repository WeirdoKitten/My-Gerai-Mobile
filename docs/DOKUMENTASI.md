# Aturan Dokumentasi

## Prinsip

- Dokumen harus **mencerminkan kondisi nyata** repo, bukan rencana yang kedaluwarsa. Dokumen salah lebih berbahaya daripada tidak ada dokumen.
- Ringkas. Kalau penjelasan sudah ada di dokumen lain (termasuk repo web), **tautkan**, jangan salin.
- Bahasa Indonesia yang baik dan benar ([RULES.md §1](RULES.md#1-bahasa)).

## Dokumen Mana di Repo Mana

| Jenis perubahan | Repo | Dokumen |
|---|---|---|
| Alur bisnis, aturan uang, status Pesanan, scope fitur | **web** | `../My-Gerai/docs/PRD.md`, `BACKLOG.md` |
| Tabel/kolom/relasi data | **web** | `../My-Gerai/docs/DATA-MODEL.md` |
| Endpoint API mobile (tambah/ubah/hapus field) | **web** | [API-MOBILE.md](../../My-Gerai/docs/API-MOBILE.md) + ADR web kalau berdampak |
| Istilah domain baru | **web** | `../My-Gerai/docs/GLOSSARY.md` |
| Library/tool/layanan mobile | mobile | [TEKNOLOGI.md](TEKNOLOGI.md) |
| Keputusan arsitektur aplikasi (navigasi, cache, auth klien, printer, push klien) | mobile | [ARSITEKTUR-SISTEM.md](ARSITEKTUR-SISTEM.md) (baris ADR baru) |
| Struktur folder nyata | mobile | [ARSITEKTUR-FOLDER.md](ARSITEKTUR-FOLDER.md) |
| Token tema, komponen UI baku, layout | mobile | [DESAIN-SISTEM.md](DESAIN-SISTEM.md) |
| Task aplikasi | mobile | [BACKLOG.md](BACKLOG.md) |
| Perubahan signifikan apa pun di repo ini | mobile | **[CHANGELOG.md](../CHANGELOG.md)** (selalu) |

## Aturan Lintas Repo

- Perubahan kontrak API di repo web yang memengaruhi aplikasi → tambah item di [BACKLOG.md](BACKLOG.md) repo ini untuk menyesuaikan aplikasi.
- Fitur Pedagang baru di salah satu repo → catat di BACKLOG keduanya ([RULES.md §5.4](RULES.md#5-alur-kerja-fitur)).
- Kalau token desain web berubah, sinkronkan [DESAIN-SISTEM.md](DESAIN-SISTEM.md) dan `src/theme.ts`.
- Tautan ke repo web memakai path relatif `../../My-Gerai/docs/...` dari folder `docs/`, atau `../My-Gerai/docs/...` dari root. Keduanya mengandalkan dua repo di-clone bersebelahan.

## Format Entri CHANGELOG.md

```
## YYYY-MM-DD — Judul singkat perubahan

**Dampak:** [dokumen/kode yang berubah, dipisah koma]
**Alasan:** [kenapa: keputusan User? temuan teknis? perubahan API web?]
**Ringkasan:** [1-3 kalimat atau poin inti]
```

Entri terbaru di paling atas. Sebutkan juga status verifikasi (apa yang sudah dicoba di emulator/HP, apa yang belum).

## Siapa yang Menjaga

- **Claude** mengusulkan dan menulis update dokumen setiap task yang berdampak, tanpa menunggu diminta.
- Perubahan **signifikan** (arsitektur, alur auth, stack) dikonfirmasi User dulu.
- User bisa meminta "cek apakah ground truth masih sesuai". Claude lalu membandingkan `docs/` (dan dokumen web terkait) dengan kode nyata dan melaporkan selisihnya.

## Menjaga Dokumen Tidak Membengkak

- Sebelum membuat dokumen baru, cek apakah isinya cocok di dokumen yang ada.
- Dokumen terlalu panjang → diskusikan pemecahan dengan User, catat di CHANGELOG.
