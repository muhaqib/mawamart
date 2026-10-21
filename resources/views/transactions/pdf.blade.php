<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Riwayat Transaksi</title>
    <style>
        * { box-sizing: border-box; letter-spacing: 0; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 12px; line-height: 18px; }
        h2 { font-size: 16px; line-height: 24px; font-weight: 600; margin: 0 0 8px; }
        p { margin: 0; color: #5a6a85; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: 700; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h2>Laporan Riwayat Transaksi</h2>
    <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    
    <table>
        <thead>
            <tr>
                <th>Nomor</th>
                <th>Kode</th>
                <th>Tanggal</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Status Transaksi</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; @endphp
            @foreach($transactions as $index => $transaction)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $transaction->kode_transaksi }}</td>
                <td>{{ $transaction->created_at->format('d/m/Y H:i') }}</td>
                <td>{{ $transaction->user?->name ?? 'Tidak diketahui' }}</td>
                <td>{{ $transaction->customer_name ?? '-' }}</td>
                <td>{{ $transaction->payment_type === 'cash' ? 'Tunai' : ($transaction->payment_type === 'transfer' ? 'Transfer' : '-') }}</td>
                <td>{{ $transaction->payment_status === 'paid' ? 'Lunas' : 'Belum Bayar' }}</td>
                <td>{{ $transaction->status === 'void' ? 'Batal' : 'Selesai' }}</td>
                <td class="text-right">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
            </tr>
            @php if ($transaction->status !== 'void') { $grandTotal += $transaction->total; } @endphp
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <th colspan="8" class="text-right">Total Keseluruhan</th>
                <th class="text-right">Rp {{ number_format($grandTotal, 0, ',', '.') }}</th>
            </tr>
        </tfoot>
    </table>
</body>
</html>
