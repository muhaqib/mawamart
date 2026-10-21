# Mawa Mart

Aplikasi transaksi, stok, pembelian, pengeluaran, laporan, approval, dan cetak nota Mawa Mart.

## Kebutuhan Server

- PHP sesuai batas versi pada `composer.json`, beserta ekstensi PDO, Mbstring, OpenSSL, GD, dan Intl.
- MySQL/MariaDB, Composer, Node.js, npm, dan web server dengan HTTPS.
- Worker queue Laravel yang dijalankan oleh process manager.

## Pemeriksaan Sebelum Deploy

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
composer audit
npm ci
npm audit
npm run typecheck
npm run build
php artisan test
vendor/bin/pint --test
```

Jalankan migrasi fresh hanya pada database testing, bukan database produksi.

## Deploy Produksi

1. Salin `.env.example` menjadi `.env`, isi database dan domain HTTPS, lalu jalankan `php artisan key:generate` hanya untuk instalasi baru.
2. Pastikan `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` memakai HTTPS, `SESSION_ENCRYPT=true`, dan `SESSION_SECURE_COOKIE=true`.
3. Cadangkan database dan folder `storage/app` sebelum mengganti rilis.
4. Jalankan perintah berikut dari direktori rilis:

```bash
php artisan down --retry=60
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run typecheck
npm run build
php artisan migrate --force
php artisan optimize
php artisan queue:restart
php artisan up
```

5. Periksa `/up`, login admin, login kasir, transaksi uji, approval, laporan, dan preview nota.

Untuk instalasi kosong, akun awal hanya dibuat jika variabel `SEED_ADMIN_*` atau `SEED_CASHIER_*` diisi sebelum `php artisan db:seed --force`. Seeder memakai `firstOrCreate`, sehingga akun yang sudah ada dan password-nya tidak pernah direset. Kosongkan kembali variabel password setelah seeding.

## Backup

Simpan backup terenkripsi di lokasi berbeda dari server aplikasi. Contoh MySQL:

```bash
mysqldump --single-transaction --routines --triggers -u USER -p DATABASE > mawa-mart.sql
```

Cadangkan juga `storage/app`, `.env` melalui secret manager, dan catat commit/rilis aktif. Uji pemulihan backup secara berkala pada lingkungan terpisah.

## Rollback

1. Aktifkan maintenance mode dan hentikan worker queue.
2. Kembalikan kode ke rilis sebelumnya.
3. Pulihkan database dari backup jika migrasi baru sudah berjalan. Jangan memakai `migrate:rollback` sebagai pengganti backup untuk data produksi.
4. Jalankan `composer install`, `npm ci`, `npm run build`, `php artisan optimize`, lalu hidupkan worker dan aplikasi.
5. Ulangi smoke test admin, kasir, transaksi, dan nota.

## Cetak Nota

- Android Bluetooth: gunakan RawBT untuk teks thermal 58mm.
- Browser desktop atau ponsel: dialog cetak memakai printer yang terhubung ke perangkat. Pilih ukuran kertas yang sesuai driver printer.
- Server production tidak dapat mengakses printer USB/Bluetooth milik pengguna secara langsung. Print agent lokal bersifat opsional dan tidak mengubah alur RawBT atau cetak browser.
