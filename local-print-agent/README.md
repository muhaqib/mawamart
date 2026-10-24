# Local Print Agent Toko Mawa

Agent ini dijalankan di komputer kasir agar aplikasi yang sudah deploy di VPS tetap bisa mencetak langsung ke printer thermal lokal tanpa membuka halaman baru.

## Cara pakai di komputer kasir

1. Pastikan printer X58MP II sudah terpasang dan bisa test print dari Windows.
2. Salin konfigurasi:

```powershell
Copy-Item local-print-agent\config.example.json local-print-agent\config.json
```

3. Sesuaikan `local-print-agent/config.json`.

Untuk printer yang terbaca sebagai COM6:

```json
{
    "port": 9123,
    "connector": "serial",
    "printer": "COM6",
    "baud": 9600,
    "width": 32
}
```

Untuk printer yang di-share di Windows:

```json
{
    "port": 9123,
    "connector": "windows_share",
    "printer": "\\\\localhost\\X58MP",
    "width": 32
}
```

4. Jalankan agent:

```powershell
npm run print-agent
```

Biarkan terminal tetap aktif selama kasir memakai aplikasi. Web yang sudah deploy akan mengirim struk ke `http://127.0.0.1:9123/print` di komputer kasir, lalu agent meneruskan ke printer X58MP II.

Di `.env` VPS gunakan:

```env
THERMAL_AUTO_PRINT=false
```

Print otomatis dari deploy dilakukan oleh browser kasir melalui local print agent, bukan oleh server VPS.
