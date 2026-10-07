# Tips Menulis Prompt (untuk User)

> Cara meminta sesuatu ke Claude supaya hasilnya tepat dan cepat di repo aplikasi ini. Tips umum ada di [PROMPT-TIPS repo web](../../My-Gerai/docs/PROMPT-TIPS.md).

## Sebut Konteksnya

- **Layar atau tahap mana**: "di layar antrean Pesanan", "Tahap 2 cetak struk".
- **Repo mana**: kalau perubahan menyangkut aturan bisnis atau data, katakan juga "ini perlu ubah backend". Claude akan mengerjakan repo web dulu.
- **Bandingkan dengan web**: "samakan dengan halaman /dashboard/profil di web" sangat membantu karena web sudah jadi acuan.

## Lampirkan Bukti

- **Screenshot dari HP** untuk masalah tampilan. Lebih cepat daripada menjelaskan dengan kata-kata.
- **Merek dan model HP + versi Android** untuk masalah notifikasi, izin, atau performa.
- **Merek/model printer** untuk masalah cetak struk.
- **Pesan error persis** (salin teks atau screenshot), bukan "error".

## Contoh Prompt yang Baik

- "Notifikasi Pesanan tidak bunyi di HP Xiaomi Redmi 12C Android 14 saat layar terkunci. Kalau aplikasi terbuka, bunyi. Cek kenapa."
- "Layar Item terasa penuh. Rombak tampilannya pakai /frontend-design:frontend-design, tetap pakai warna MyGerai."
- "Tambahkan tombol bagikan QR Menu ke WhatsApp di layar Profil. Di web belum ada, catat juga di backlog web."

## Hal yang Sebaiknya Dihindari

- Meminta banyak fitur berbeda dalam satu prompt. Satu tujuan per permintaan lebih mudah diverifikasi.
- "Pokoknya jalan dulu." Claude akan tetap menolak data palsu dan hardcode ([RULES.md §5.3](RULES.md#5-alur-kerja-fitur)).
