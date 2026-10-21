# PRD - Mawa Mart Management System

## 1. Informasi Produk

**Nama produk:** Mawa Mart Management System
**Jenis produk:** Aplikasi POS dan manajemen ritel/stok untuk operasional Mawa Mart.
**Pengguna utama:** Admin dan Kasir.
**Status dokumen:** PRD operasional sebelum eksekusi lanjutan aplikasi.
**Status implementasi saat ini:** Aplikasi Laravel dengan UI React/Vite untuk area login setelah autentikasi, serta Blade sebagai bootstrap view dan fallback.

### Tujuan Produk

1. Mempercepat proses transaksi penjualan air.
2. Menjaga akurasi stok barang secara otomatis.
3. Menyediakan laporan penjualan, stok masuk, stok keluar, dan kasir.
4. Membatasi akses berdasarkan role Admin dan Kasir.
5. Membuat alur POS lebih sesuai SOP: buka kasir, transaksi, pelunasan, pembatalan, stok masuk, rekonsiliasi, dan tutup kasir.

## 2. Masalah yang Diselesaikan

1. Transaksi manual rawan salah hitung.
2. Stok barang tidak selalu sinkron dengan penjualan.
3. Laporan harian dan periode sulit direkap cepat.
4. Akses kasir perlu dibatasi agar tidak dapat mengubah data master secara bebas.
5. Dokumen operasional seperti bukti barang masuk perlu tersimpan lebih aman.
6. Pembatalan transaksi, diskon, pending payment, dan tutup kasir perlu memiliki jejak audit yang jelas.

## 3. User Role dan Hak Akses

### 3.1 Admin

Admin dapat:

1. Mengakses dashboard global.
2. Mengelola produk dan kategori.
3. Mengelola stok masuk.
4. Melihat dan mengelola seluruh transaksi.
5. Mengelola kasir.
6. Melihat laporan penjualan, stok, dan kasir.
7. Mengakses dokumen stok masuk.
8. Mengaktifkan atau menonaktifkan user.

Admin tidak boleh:

1. Menghapus data transaksi tanpa audit.
2. Mengubah stok tanpa alasan dan catatan.
3. Mengubah histori pembayaran tanpa jejak perubahan.

### 3.2 Kasir

Kasir dapat:

1. Login ke aplikasi.
2. Melihat dashboard kasir pribadi.
3. Membuat transaksi penjualan.
4. Mencetak atau melihat nota.
5. Melihat riwayat transaksi miliknya.
6. Melunasi transaksi pending miliknya sesuai kebijakan.

Kasir tidak dapat:

1. Mengelola produk.
2. Mengelola kategori.
3. Mengelola stok masuk.
4. Mengelola user atau kasir lain.
5. Mengakses laporan global admin.
6. Membatalkan transaksi tanpa aturan otorisasi.

### 3.3 User Nonaktif

1. User nonaktif tidak boleh masuk ke area aplikasi.
2. Sesi user nonaktif harus ditolak saat mengakses halaman setelah login.
3. User nonaktif diarahkan keluar dengan pesan yang jelas.

## 4. Scope MVP

### 4.1 Termasuk MVP

1. Login dan logout.
2. Role Admin dan Kasir.
3. Dashboard sesuai role.
4. CRUD produk dan kategori untuk Admin.
5. Stok masuk untuk Admin.
6. Transaksi penjualan untuk Admin dan Kasir.
7. Status pembayaran: lunas dan belum bayar.
8. Metode pembayaran: cash dan transfer.
9. Nota transaksi.
10. Laporan penjualan dengan filter tanggal.
11. Laporan kasir.
12. Penyimpanan dokumen stok masuk secara private.
13. Penomoran transaksi otomatis per tanggal.

### 4.2 Di Luar MVP, Masuk Backlog SOP

1. Shift kasir lengkap: buka kasir dan tutup kasir.
2. Cash drawer reconciliation.
3. Void transaksi dengan approval.
4. Retur dan refund.
5. Stock opname.
6. Audit log detail.
7. Approval diskon di atas batas tertentu.
8. Verifikasi pembayaran transfer.
9. Integrasi QRIS.
10. Barcode scanner.

## 5. SOP POS Operasional

### 5.1 SOP Buka Kasir

Status: backlog prioritas tinggi.

Alur ideal:

1. Kasir login.
2. Kasir membuka shift.
3. Kasir mengisi modal awal kas.
4. Sistem menyimpan waktu buka shift, user kasir, dan nominal modal awal.
5. Kasir hanya dapat membuat transaksi setelah shift aktif.

Catatan implementasi:

1. Saat ini aplikasi belum wajib membuka shift sebelum transaksi.
2. Perlu tabel `cashier_shifts`.
3. Transaksi perlu terhubung ke shift aktif.

### 5.2 SOP Transaksi Penjualan

Alur:

1. Kasir memilih produk.
2. Sistem menampilkan harga dan stok tersedia.
3. Kasir mengisi jumlah barang.
4. Sistem menghitung subtotal, diskon, dan total.
5. Kasir memilih status pembayaran:
   - Lunas.
   - Belum bayar.
6. Kasir memilih metode pembayaran:
   - Cash.
   - Transfer.
7. Sistem memvalidasi stok.
8. Sistem membuat nomor transaksi otomatis.
9. Sistem mengurangi stok produk.
10. Sistem menyimpan detail transaksi.
11. Sistem menampilkan nota.

Aturan:

1. Jumlah item harus lebih dari 0.
2. Stok tidak boleh minus.
3. Diskon tidak boleh melebihi total sebelum diskon.
4. Transaksi pending tetap mengurangi stok karena barang sudah keluar.
5. Kode transaksi harus unik.

### 5.3 SOP Pelunasan Transaksi Belum Bayar

Alur:

1. Admin atau kasir terkait membuka transaksi belum bayar.
2. User memilih aksi pelunasan.
3. User memilih metode pembayaran pelunasan.
4. Sistem mengubah status menjadi lunas.
5. Sistem menyimpan waktu pelunasan dan user yang memproses.

Catatan implementasi:

1. Saat ini status pembayaran sudah ada.
2. Perlu field tambahan untuk audit pelunasan:
   - `paid_at`
   - `paid_by`
   - `payment_verified_at` untuk transfer bila diperlukan.

### 5.4 SOP Diskon

Aturan:

1. Diskon nominal tidak boleh lebih besar dari subtotal.
2. Diskon harus tersimpan di transaksi.
3. Diskon besar perlu approval Admin.

Status:

1. Validasi diskon tidak melebihi total sudah wajib.
2. Approval diskon belum tersedia dan masuk backlog.

### 5.5 SOP Void atau Pembatalan Transaksi

Status: perlu diperbaiki sebelum production serius.

Alur ideal:

1. User memilih transaksi.
2. User mengisi alasan pembatalan.
3. Jika kasir, pembatalan butuh approval Admin.
4. Sistem mengubah status transaksi menjadi void.
5. Sistem mengembalikan stok.
6. Sistem menyimpan siapa yang membatalkan, waktu pembatalan, dan alasan.

Catatan penting:

1. Transaksi tidak boleh dihapus permanen tanpa audit.
2. Pembatalan harus menggunakan status `void` atau soft delete.
3. Perlu field:
   - `voided_at`
   - `voided_by`
   - `void_reason`
   - `status`

### 5.6 SOP Retur dan Refund

Status: backlog.

Alur ideal:

1. Admin memilih transaksi asal.
2. Admin memilih item yang diretur.
3. Sistem memvalidasi jumlah retur.
4. Sistem mengembalikan stok bila barang fisik kembali.
5. Sistem mencatat nilai refund bila uang dikembalikan.
6. Sistem menyimpan alasan retur.

### 5.7 SOP Tutup Kasir

Status: backlog prioritas tinggi.

Alur ideal:

1. Kasir membuka halaman tutup kasir.
2. Sistem menghitung total transaksi cash, transfer, pending, dan void.
3. Kasir mengisi jumlah uang fisik.
4. Sistem menghitung selisih.
5. Kasir mengisi catatan bila ada selisih.
6. Admin dapat melihat laporan shift.

Data yang dibutuhkan:

1. Modal awal.
2. Total cash.
3. Total transfer.
4. Total pending.
5. Total void.
6. Uang fisik akhir.
7. Selisih.
8. Catatan kasir.

### 5.8 SOP Barang Masuk

Alur:

1. Admin memilih produk.
2. Admin mengisi jumlah masuk.
3. Admin mengisi tanggal barang masuk.
4. Admin dapat mengunggah dokumen pendukung.
5. Sistem menambah stok produk.
6. Sistem menyimpan histori stok masuk.

Aturan:

1. Jumlah barang masuk harus lebih dari 0.
2. Dokumen pendukung tidak boleh diakses publik langsung.
3. Dokumen diakses melalui route aplikasi dengan otorisasi.

### 5.9 SOP Stock Opname

Status: backlog prioritas tinggi.

Alur ideal:

1. Admin membuat sesi stock opname.
2. Admin mencatat stok fisik per produk.
3. Sistem membandingkan stok sistem dan stok fisik.
4. Admin mengisi alasan selisih.
5. Sistem membuat penyesuaian stok dengan audit.

### 5.10 SOP Rekonsiliasi Transfer

Status: backlog.

Alur ideal:

1. Transaksi transfer masuk status menunggu verifikasi.
2. Admin mencocokkan mutasi atau bukti transfer.
3. Admin menandai transfer terverifikasi.
4. Sistem menyimpan waktu dan user verifikator.

## 6. Fitur Produk

### 6.1 Login dan Keamanan

1. User login menggunakan email dan password.
2. Login dibatasi throttle untuk mencegah brute force.
3. Password harus disimpan dalam bentuk hash.
4. User nonaktif tidak boleh mengakses aplikasi.
5. Area aplikasi harus dilindungi middleware autentikasi.

### 6.2 Dashboard

Admin melihat:

1. Total penjualan.
2. Jumlah transaksi.
3. Produk dengan stok rendah.
4. Ringkasan pembayaran.
5. Ringkasan transaksi terbaru.

Kasir melihat:

1. Total transaksi miliknya.
2. Total penjualan miliknya.
3. Transaksi terbaru miliknya.
4. Pending payment miliknya.

### 6.3 Produk dan Kategori

Admin dapat:

1. Membuat produk.
2. Mengubah produk.
3. Menghapus produk sesuai aturan.
4. Mengatur kategori.
5. Mengatur harga.
6. Melihat stok.

Aturan:

1. Produk dengan histori transaksi sebaiknya tidak dihapus permanen.
2. Produk dapat dinonaktifkan bila tidak dijual lagi.

### 6.4 Transaksi

Field minimum transaksi:

1. Kode transaksi.
2. User kasir.
3. Tanggal transaksi.
4. Status pembayaran.
5. Metode pembayaran.
6. Subtotal.
7. Diskon.
8. Total.
9. Catatan.

Nomor transaksi:

1. Format: `TRX-yymmdd-0001`.
2. Nomor urut reset per tanggal.
3. Nomor harus aman dari duplikasi saat transaksi bersamaan.

### 6.5 Nota

Nota harus menampilkan:

1. Nama outlet.
2. Kode transaksi.
3. Tanggal transaksi.
4. Nama kasir.
5. Daftar item.
6. Qty, harga, subtotal.
7. Diskon.
8. Total bayar.
9. Status pembayaran.
10. Metode pembayaran.

### 6.6 Laporan

Laporan minimum:

1. Laporan penjualan per periode.
2. Laporan transaksi per kasir.
3. Laporan barang masuk.
4. Laporan stok produk.
5. Laporan pending payment.

Filter:

1. Tanggal mulai.
2. Tanggal akhir.
3. Kasir.
4. Status pembayaran.
5. Metode pembayaran.

## 7. Data dan Database

### 7.1 Tabel Utama

`users`

1. Menyimpan admin dan kasir.
2. Memiliki role.
3. Memiliki status aktif atau nonaktif.

`categories`

1. Menyimpan kategori produk.

`products`

1. Menyimpan produk, harga, stok, dan kategori.

`stock_ins`

1. Menyimpan histori barang masuk.
2. Menyimpan dokumen pendukung bila ada.

`transactions`

1. Menyimpan header transaksi.
2. Menyimpan total, status, metode pembayaran, dan kasir.

`transaction_details`

1. Menyimpan item transaksi.
2. Menyimpan harga saat transaksi agar histori tidak berubah bila harga produk berubah.

`transaction_sequences`

1. Menyimpan urutan nomor transaksi per tanggal.
2. Digunakan agar kode transaksi tidak duplikat.

### 7.2 Tabel Backlog SOP

`cashier_shifts`

1. Menyimpan buka dan tutup kasir.

`audit_logs`

1. Menyimpan aktivitas penting user.

`stock_opnames`

1. Menyimpan sesi stock opname.

`stock_adjustments`

1. Menyimpan koreksi stok.

`payment_verifications`

1. Menyimpan verifikasi pembayaran transfer.

`refunds`

1. Menyimpan retur dan refund.

## 8. Validasi dan Business Rules

1. Tanggal awal filter tidak boleh lebih besar dari tanggal akhir.
2. Qty transaksi harus integer dan lebih dari 0.
3. Qty transaksi tidak boleh melebihi stok tersedia.
4. Harga transaksi diambil dari harga produk saat transaksi dibuat.
5. Diskon tidak boleh negatif.
6. Diskon tidak boleh melebihi subtotal.
7. Status pembayaran hanya boleh dari daftar resmi.
8. Metode pembayaran hanya boleh dari daftar resmi.
9. User nonaktif tidak boleh membuat transaksi.
10. Dokumen stok masuk harus divalidasi tipe dan ukuran file.
11. Dokumen private tidak boleh disajikan langsung dari public storage tanpa otorisasi.

## 9. Audit, Security, dan Compliance

### 9.1 Keamanan Minimum

1. Jangan commit file `.env`.
2. Jangan commit backup database.
3. Jangan commit file kredensial.
4. Gunakan hash untuk password.
5. Gunakan CSRF protection.
6. Gunakan middleware role.
7. Gunakan validasi request.
8. Batasi percobaan login.

### 9.2 Audit Minimum

Aktivitas berikut harus memiliki audit trail:

1. Login gagal berulang.
2. Membuat transaksi.
3. Melunasi transaksi.
4. Membatalkan transaksi.
5. Mengubah produk.
6. Mengubah stok.
7. Mengunggah atau mengakses dokumen stok masuk.
8. Menutup shift kasir.

### 9.3 Risiko Saat Ini

1. Pembatalan transaksi perlu diarahkan ke mekanisme void dengan alasan.
2. Shift kasir belum tersedia.
3. Stock opname belum tersedia.
4. Audit log belum lengkap.
5. Verifikasi transfer belum tersedia.

## 10. UI/UX

### 10.1 Prinsip UI

1. Tampilan utama harus fokus pada pekerjaan kasir dan admin.
2. Navigasi harus jelas dan konsisten.
3. Tombol aksi utama harus mudah ditemukan.
4. Tabel transaksi harus mudah difilter dan dipindai.
5. Form transaksi harus meminimalkan kesalahan input.
6. Status seperti lunas, belum bayar, stok rendah, dan void harus terlihat jelas.

### 10.2 Framework UI

1. Area aplikasi menggunakan React dengan Vite.
2. Styling mengikuti pendekatan TailwindAdmin.
3. Blade tetap digunakan sebagai bootstrap view Laravel dan fallback.
4. Layout harus penuh mengikuti layar aplikasi, bukan tampilan sempit seperti landing page.

### 10.3 Tipografi

1. Font utama aplikasi menggunakan `DM Sans`, dengan fallback `ui-sans-serif`, `system-ui`, dan `sans-serif`.
2. Tipografi harus terasa seperti aplikasi operasional: jelas, ringkas, mudah dipindai, dan tidak bergaya landing page.
3. Heading halaman utama menggunakan ukuran sekitar 24px dengan line-height sekitar 32px dan weight 600.
4. Heading panel atau section menggunakan ukuran sekitar 16px dengan weight 600.
5. Heading card kecil menggunakan ukuran sekitar 14px dengan weight 600.
6. Body text dan isi tabel menggunakan ukuran sekitar 14px.
7. Teks bantuan, metadata, subtitle, dan keterangan sekunder menggunakan ukuran sekitar 13px dengan warna muted.
8. Angka penting pada metric card menggunakan ukuran sekitar 28px dengan weight 700.
9. Label form menggunakan ukuran sekitar 14px dengan weight 600.
10. Tombol menggunakan ukuran sekitar 14px dengan weight 600, kecuali tombol utama login dapat menggunakan weight 500 sesuai gaya TailwindAdmin.
11. Badge status menggunakan ukuran sekitar 12px dengan weight 700.
12. Letter spacing tetap normal atau 0; jangan memakai tracking negatif.
13. Line-height harus cukup longgar untuk keterbacaan, terutama pada tabel, form, dan ringkasan operasional.
14. Hirarki teks harus konsisten di seluruh aplikasi: page title, subtitle, panel title, card title, value, body, metadata.
15. Teks tidak boleh terpotong atau bertumpuk pada layar mobile; gunakan wrapping atau ukuran yang lebih kecil bila ruang terbatas.

## 11. Teknologi

Stack target:

1. PHP 8.3 atau lebih baru.
2. Laravel 13.
3. React.
4. Vite.
5. Tailwind CSS.
6. MySQL atau MariaDB untuk production.
7. SQLite untuk testing lokal bila diperlukan.
8. DomPDF untuk PDF.
9. FastExcel atau Laravel Excel untuk export laporan.

## 12. Acceptance Criteria

### 12.1 Auth

1. Admin aktif dapat login.
2. Kasir aktif dapat login.
3. User nonaktif tidak dapat mengakses aplikasi.
4. Percobaan login berlebihan terkena throttle.

### 12.2 Transaksi

1. User dapat membuat transaksi dengan item valid.
2. Stok berkurang setelah transaksi dibuat.
3. Sistem menolak transaksi bila stok kurang.
4. Sistem menolak diskon melebihi subtotal.
5. Kode transaksi unik dan berurutan per tanggal.
6. Nota dapat ditampilkan setelah transaksi dibuat.

### 12.3 Pelunasan

1. Transaksi belum bayar dapat diubah menjadi lunas.
2. Sistem menyimpan siapa yang memproses pelunasan.
3. Sistem menyimpan waktu pelunasan.

### 12.4 Produk dan Stok

1. Admin dapat membuat dan mengubah produk.
2. Admin dapat mencatat barang masuk.
3. Stok bertambah setelah barang masuk.
4. Dokumen barang masuk hanya dapat diakses user berotorisasi.

### 12.5 Laporan

1. Admin dapat melihat laporan berdasarkan tanggal.
2. Filter tanggal tervalidasi.
3. Kasir hanya melihat data yang menjadi haknya.

## 13. Backlog Prioritas SOP POS

### Prioritas Tinggi

1. Shift kasir: buka kasir dan tutup kasir.
2. Void transaksi dengan alasan dan approval.
3. Audit log aktivitas penting.
4. Stock opname dan penyesuaian stok.
5. Pelunasan pending payment dengan audit.

### Prioritas Menengah

1. Verifikasi transfer.
2. Retur dan refund.
3. Approval diskon.
4. Minimum stock alert.
5. Laporan laba sederhana bila harga modal tersedia.

### Prioritas Rendah

1. Barcode scanner.
2. QRIS.
3. Kirim nota WhatsApp.
4. Multi cabang.
5. Member atau pelanggan tetap.

## 14. Definition of Done

Sebuah fitur dianggap selesai bila:

1. Sesuai role dan hak akses.
2. Memiliki validasi request.
3. Tidak merusak stok atau histori transaksi.
4. Memiliki audit untuk aksi kritis.
5. Memiliki tampilan yang konsisten.
6. Memiliki test untuk alur utama dan validasi penting.
7. Tidak membuka data sensitif ke publik.
8. Tidak bergantung pada file `.env`, backup SQL, atau kredensial yang masuk Git.
