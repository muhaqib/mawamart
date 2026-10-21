@extends('layouts.print')

@section('title', 'Nota '.$transaction->kode_transaksi)

@section('content')
@php
    $pdfMode = $pdfMode ?? false;
    $selectedSize = $receiptLayout['size'] ?? '58mm';
    $isThermalSafe = in_array($selectedSize, ['58mm', '80mm'], true);
    $thermalWidth = $selectedSize === '80mm' ? 42 : 32;
    $receiptSettings = \App\Models\AppSetting::receiptSettings();
    $enabled = fn (string $key) => \App\Models\AppSetting::enabled($receiptSettings, $key);
    $headerLines = array_filter([
        $receiptSettings['receipt_address_line_1'] ?? '',
        $receiptSettings['receipt_address_line_2'] ?? '',
        $receiptSettings['receipt_phone'] ?? '',
    ]);
    $footerLines = array_filter([
        $receiptSettings['receipt_footer_line_1'] ?? '',
        $receiptSettings['receipt_footer_line_2'] ?? '',
        $receiptSettings['receipt_footer_line_3'] ?? '',
    ]);
    $thermalContent = $isThermalSafe
        ? app(\App\Services\ThermalReceiptText::class)->text($transaction, $thermalWidth, 1)
        : '';
    $rawbtUrl = $isThermalSafe ? 'rawbt:base64,'.base64_encode($thermalContent) : '';
@endphp
<main class="wrap">
    <div class="{{ $pdfMode ? '' : 'preview-shell' }}">
        @unless($pdfMode)
            <aside class="panel">
                <div class="panel-head">
                    <div>
                        <h1>Preview Nota</h1>
                        <p>{{ $transaction->kode_transaksi }}</p>
                    </div>
                    <a class="btn compact" href="{{ route('dashboard', ['page' => 'transaction-history']) }}">Kembali</a>
                </div>

                @if(session('success'))
                    <div class="notice ok">{{ session('success') }}</div>
                @endif
                @if(session('warning'))
                    <div class="notice warn">{{ session('warning') }}</div>
                @endif

                <form class="print-size" method="GET" action="{{ route('transactions.receipt', $transaction) }}">
                    <label for="receipt-size">Ukuran cetak</label>
                    <select id="receipt-size" name="size" onchange="this.form.submit()">
                        @foreach($receiptSizes as $value => $option)
                            <option value="{{ $value }}" @selected($selectedSize === $value)>{{ $option['label'] }}</option>
                        @endforeach
                    </select>
                </form>

                <div class="actions">
                    <button class="btn primary full" type="button" onclick="window.print()">Cetak dari Perangkat Ini</button>
                    @if($isThermalSafe)
                        <a id="rawbt-print-link" class="btn full rawbt-action" href="{{ $rawbtUrl }}">Cetak RawBT Android</a>
                    @endif
                </div>

                <div class="hint">{{ request()->boolean('autoprint') ? 'Pilih printer yang terhubung ke perangkat ini. Ukuran utama 58mm.' : 'Default 58mm. Pilih ukuran lain jika memakai printer biasa.' }}</div>
            </aside>
        @endif
        <div class="{{ $pdfMode ? '' : 'paper-stage' }}">
        <section class="receipt {{ $isThermalSafe ? 'thermal-receipt' : '' }}">
            @if($isThermalSafe)
                <pre class="thermal-pre">{{ $thermalContent }}</pre>
            @else
            <h3>{{ $receiptSettings['receipt_store_name'] }}</h3>
            @if($headerLines)
                <p>{!! collect($headerLines)->map(fn ($line) => e($line))->implode('<br>') !!}</p>
            @endif
            <hr>
            <div class="line"><span>Nomor</span><strong>{{ $transaction->kode_transaksi }}</strong></div>
            <div class="line"><span>Tanggal</span><span>{{ $transaction->created_at->format('d/m/Y H:i') }}</span></div>
            @if($enabled('receipt_show_cashier'))
                <div class="line"><span>Kasir</span><span>{{ $transaction->user->name }}</span></div>
            @endif
            @if($transaction->status === 'void')
                <div class="line"><span>Status Transaksi</span><strong>VOID</strong></div>
                <div class="line"><span>Alasan</span><span>{{ $transaction->void_reason ?: '-' }}</span></div>
            @endif
            @if($enabled('receipt_show_customer') && $transaction->customer_name)
                <div class="line"><span>Pelanggan</span><span>{{ $transaction->customer_name }}</span></div>
            @endif
            <hr>
            @php $subtotal = 0; @endphp
            @php $totalDiscount = 0; @endphp
            @foreach ($transaction->details as $detail)
                @php
                    $normalSubtotal = $detail->harga * $detail->qty;
                    $discount = max(0, $normalSubtotal - $detail->subtotal);
                    $subtotal += $normalSubtotal;
                    $totalDiscount += $discount;
                @endphp
                <div class="line"><span>{{ $detail->product?->nama_barang ?? 'Produk dihapus' }}</span><span>{{ $detail->qty }} x {{ number_format($detail->harga, 0, ',', '.') }}</span></div>
                <div class="line"><span></span><strong>{{ number_format($detail->subtotal, 0, ',', '.') }}</strong></div>
            @endforeach
            <hr>
            <div class="line"><span>Subtotal</span><span>{{ number_format($subtotal, 0, ',', '.') }}</span></div>
            @if ($totalDiscount > 0)
                <div class="line"><span>Diskon</span><span>{{ number_format($totalDiscount, 0, ',', '.') }}</span></div>
            @endif
            <div class="line"><span>Total</span><strong>{{ number_format($transaction->total, 0, ',', '.') }}</strong></div>
            @if($enabled('receipt_show_payment'))
                <div class="line"><span>Status</span><strong>{{ $transaction->payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR' }}</strong></div>
                <div class="line"><span>Metode</span><span>{{ $transaction->payment_type === 'cash' ? 'Tunai' : ($transaction->payment_type === 'transfer' ? 'Transfer' : '-') }}</span></div>
                @if ($transaction->payment_type === 'transfer')
                    <div class="line"><span>Bank</span><span>{{ $transaction->bank_name ?: '-' }}</span></div>
                    <div class="line"><span>Ref</span><span>{{ $transaction->reference_number ?: '-' }}</span></div>
                    <div class="line"><span>Verifikasi</span><span>{{ $transaction->payment_verified_at ? 'Terverifikasi' : 'Belum diverifikasi' }}</span></div>
                @endif
                @if ($transaction->payment_status === 'paid')
                    <div class="line"><span>Diterima</span><span>{{ number_format($transaction->uang_diterima, 0, ',', '.') }}</span></div>
                    <div class="line"><span>Kembali</span><strong>{{ number_format($transaction->kembalian, 0, ',', '.') }}</strong></div>
                @endif
            @endif
            <hr>
            @if($footerLines)
                <p>{!! collect($footerLines)->map(fn ($line) => e($line))->implode('<br>') !!}</p>
            @endif
            @endif
        </section>
        </div>
    </div>
</main>
@if($isThermalSafe && ! $pdfMode)
    <script>
        if (/Android/i.test(window.navigator.userAgent)) {
            document.getElementById('rawbt-print-link')?.classList.add('show');
        }
    </script>
@endif
@endsection
