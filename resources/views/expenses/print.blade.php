<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Cetak Pengeluaran</title>
    <style>
        * { box-sizing: border-box; letter-spacing: 0; }
        body { margin: 0; padding: 24px; color: #1c2536; font-family: "DejaVu Sans", Arial, sans-serif; font-size: 12px; line-height: 18px; }
        h1 { margin: 0 0 4px; font-size: 20px; line-height: 28px; }
        p { margin: 0; color: #5a6a85; }
        .head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 22px; border-bottom: 2px solid #dfe5ef; padding-bottom: 14px; }
        .summary { margin-bottom: 18px; padding: 12px 14px; border: 1px solid #fdd7cc; background: #ffede8; color: #bd2d2d; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #dfe5ef; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #f6f9fc; color: #1c2536; }
        .text-right { text-align: right; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    @php $total = $expenses->sum('amount'); @endphp
    <div class="head">
        <div>
            <h1>Laporan Pengeluaran Toko</h1>
            <p>Periode {{ \Illuminate\Support\Carbon::parse($startDate)->format('d/m/Y') }} - {{ \Illuminate\Support\Carbon::parse($endDate)->format('d/m/Y') }}</p>
        </div>
        <p>Dicetak: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="summary">Total pengeluaran: Rp {{ number_format($total, 0, ',', '.') }}</div>

    <table>
        <thead>
            <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>Uraian</th>
                <th class="text-right">Vol</th>
                <th>Satuan</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Jumlah</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenses as $expense)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $expense->spent_at->format('d/m/Y') }}</td>
                    <td>{{ $expense->uraian ?? $expense->description }}</td>
                    <td class="text-right">{{ number_format((float) ($expense->volume ?? 1), 2, ',', '.') }}</td>
                    <td>{{ $expense->unit ?? 'Unit' }}</td>
                    <td class="text-right">Rp {{ number_format((int) ($expense->price ?? $expense->amount), 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($expense->amount, 0, ',', '.') }}</td>
                    <td>{{ $expense->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center;">Belum ada pengeluaran pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <th colspan="6" class="text-right">Total Keseluruhan</th>
                <th class="text-right">Rp {{ number_format($total, 0, ',', '.') }}</th>
                <th></th>
            </tr>
        </tfoot>
    </table>

    <script>
        window.print();
    </script>
</body>
</html>
