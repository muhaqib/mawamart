<?php

namespace App\Http\Controllers;

use App\Http\Requests\SettleTransactionRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Requests\VerifyTransferRequest;
use App\Jobs\PrintThermalReceipt;
use App\Models\AppSetting;
use App\Models\AuditLog;
use App\Models\CashierShift;
use App\Models\PaymentVerification;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\ThermalReceiptPrinter;
use App\Services\ThermalReceiptText;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Rap2hpoutre\FastExcel\FastExcel;
use Throwable;

class TransactionController extends Controller
{
    public function store(StoreTransactionRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();

        $data['created_at'] = Carbon::parse($data['created_at'] ?? now());

        $transaction = DB::transaction(function () use ($data) {
            $total = 0;
            $totalBeforeDiscount = 0;
            $discountTotal = 0;
            $details = [];
            $discountPerProduct = (int) ($data['discount_per_product'] ?? 0);
            $usesLineDiscount = collect($data['items'])->contains(fn ($item) => array_key_exists('discount_value', $item) || array_key_exists('discount_type', $item));
            $cashierShift = $this->currentShiftForTransaction();

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if (! $product->isActive()) {
                    throw ValidationException::withMessages([
                        'items' => "{$product->nama_barang} sedang nonaktif.",
                    ]);
                }

                if ($product->stok < $item['qty']) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->nama_barang} tidak cukup. Tersedia {$product->stok} {$product->satuan}.",
                    ]);
                }

                $lineDiscountType = $item['discount_type'] ?? 'amount';
                $lineDiscountValue = array_key_exists('discount_value', $item) ? (int) $item['discount_value'] : $discountPerProduct;
                $lineDiscount = $lineDiscountType === 'percent'
                    ? (int) round($product->harga_jual * min($lineDiscountValue, 100) / 100)
                    : $lineDiscountValue;

                if ($lineDiscountValue > 100 && $lineDiscountType === 'percent') {
                    throw ValidationException::withMessages([
                        'items' => "Diskon persen {$product->nama_barang} tidak boleh lebih dari 100%.",
                    ]);
                }

                if ($lineDiscount > $product->harga_jual) {
                    throw ValidationException::withMessages([
                        'discount_per_product' => "Diskon tidak boleh melebihi harga jual {$product->nama_barang}.",
                    ]);
                }

                $hargaSetelahDiskon = $product->harga_jual - $lineDiscount;
                $subtotal = $hargaSetelahDiskon * $item['qty'];
                $totalBeforeDiscount += $product->harga_jual * $item['qty'];
                $discountTotal += $lineDiscount * $item['qty'];
                $total += $subtotal;
                $details[] = [
                    'product' => $product,
                    'qty' => $item['qty'],
                    'harga' => $product->harga_jual,
                    'harga_modal' => $product->harga_modal,
                    'subtotal' => $subtotal,
                ];
            }

            $isPending = $data['payment_status'] === 'pending';
            $paymentType = $isPending ? null : $data['payment_type'];
            $uangDiterima = $paymentType === 'cash' ? (int) ($data['uang_diterima'] ?? 0) : ($isPending ? 0 : $total);

            if ($paymentType === 'cash' && $uangDiterima < $total) {
                throw ValidationException::withMessages([
                    'uang_diterima' => 'Uang diterima harus sama dengan atau lebih besar dari total transaksi.',
                ]);
            }

            $transaction = Transaction::create([
                'kode_transaksi' => $this->nextCode(),
                'created_at' => $data['created_at'],
                'user_id' => auth()->id(),
                'cashier_shift_id' => $cashierShift?->id,
                'customer_name' => $data['customer_name'] ?? null,
                'total' => $total,
                'discount_per_product' => $usesLineDiscount ? 0 : $discountPerProduct,
                'discount_total' => $discountTotal,
                'payment_type' => $paymentType,
                'uang_diterima' => $uangDiterima,
                'kembalian' => max(0, $uangDiterima - $total),
                'bank_name' => $paymentType === 'transfer' ? ($data['bank_name'] ?? null) : null,
                'reference_number' => $paymentType === 'transfer' ? ($data['reference_number'] ?? null) : null,
                'payment_status' => $isPending ? 'pending' : 'paid',
                'status' => 'completed',
                'paid_at' => $isPending ? null : $data['created_at'],
                'settled_by' => $isPending ? null : auth()->id(),
                'payment_verified_at' => $paymentType === 'transfer' && auth()->user()->isAdmin() ? now() : null,
                'payment_verified_by' => $paymentType === 'transfer' && auth()->user()->isAdmin() ? auth()->id() : null,
            ]);

            foreach ($details as $detail) {
                $transaction->details()->create([
                    'product_id' => $detail['product']->id,
                    'qty' => $detail['qty'],
                    'harga' => $detail['harga'],
                    'harga_modal' => $detail['harga_modal'],
                    'subtotal' => $detail['subtotal'],
                ]);

                $detail['product']->decrement('stok', $detail['qty']);
            }

            AuditLog::record('transaction.created', $transaction, [
                'kode_transaksi' => $transaction->kode_transaksi,
                'total_before_discount' => $totalBeforeDiscount,
                'discount_total' => $discountTotal,
                'total' => $transaction->total,
                'payment_status' => $transaction->payment_status,
                'payment_type' => $transaction->payment_type,
            ]);

            return $transaction;
        });

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Transaksi berhasil disimpan.',
                'redirect_url' => route('dashboard', ['page' => 'transactions']),
                'receipt_url' => route('transactions.receipt', $transaction),
            ]);
        }

        $redirect = redirect()
            ->route('dashboard', ['page' => 'transactions'])
            ->with('success', 'Transaksi berhasil disimpan.');

        if (config('thermal.auto_print')) {
            PrintThermalReceipt::dispatch($transaction->id)->afterResponse();
            $redirect->with('success', 'Transaksi berhasil disimpan dan struk thermal dikirim ke antrean cetak.');
        }

        return $redirect;
    }

    public function receipt(Request $request, Transaction $transaction): View
    {
        $this->authorize('view', $transaction);

        return view('transactions.receipt', [
            'transaction' => $transaction->load(['user', 'details.product']),
            ...$this->receiptViewData($request),
        ]);
    }

    public function receiptPdf(Request $request, Transaction $transaction)
    {
        $this->authorize('view', $transaction);

        $layout = $this->receiptLayout($request);
        $pdf = Pdf::loadView('transactions.receipt', [
            'transaction' => $transaction->load(['user', 'details.product']),
            ...$this->receiptViewData($request),
            'pdfMode' => true,
        ])->setPaper($layout['paper'], 'portrait');
        $filename = 'nota-'.$transaction->kode_transaksi.'-'.$layout['size'].'.pdf';

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    public function receiptJpeg(Request $request, Transaction $transaction, ThermalReceiptText $receiptText)
    {
        $this->authorize('view', $transaction);
        abort_unless(extension_loaded('gd'), 500, 'Ekstensi GD belum aktif untuk membuat gambar nota.');

        $transaction->load(['user', 'details.product']);

        $width = $request->query('size') === '80mm'
            ? 42
            : (int) (AppSetting::receiptSettings()['receipt_paper_width'] ?? config('thermal.width', 32));
        $width = max(24, min(42, $width));
        $text = $receiptText->text($transaction, $width, 1);
        $lines = preg_split('/\R/', rtrim($text, "\r\n")) ?: [];

        $font = 5;
        $paddingX = 24;
        $paddingY = 24;
        $bottomPadding = 48;
        $lineHeight = imagefontheight($font) + 8;
        $charWidth = imagefontwidth($font);
        $maxChars = max(array_map(fn (string $line) => strlen($line), $lines ?: ['']));
        $canvasWidth = max(($width * $charWidth) + ($paddingX * 2), ($maxChars * $charWidth) + ($paddingX * 2));
        $canvasHeight = ($paddingY * 2) + $bottomPadding + (max(1, count($lines)) * $lineHeight);

        $image = imagecreatetruecolor($canvasWidth, $canvasHeight);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 17, 24, 39);
        imagefill($image, 0, 0, $white);

        foreach ($lines as $index => $line) {
            imagestring($image, $font, $paddingX, $paddingY + ($index * $lineHeight), $line, $black);
        }

        $scaledImage = imagescale($image, $canvasWidth * 2, $canvasHeight * 2, IMG_NEAREST_NEIGHBOUR);
        imagedestroy($image);

        if (! $scaledImage) {
            abort(500, 'Gagal membuat gambar nota.');
        }

        ob_start();
        imagejpeg($scaledImage, null, 92);
        $jpeg = ob_get_clean();
        imagedestroy($scaledImage);

        return response($jpeg, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'attachment; filename="nota-'.$transaction->kode_transaksi.'.jpg"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    public function thermalPayload(Transaction $transaction): JsonResponse
    {
        $this->authorize('view', $transaction);

        return response()->json($this->thermalReceiptPayload($transaction));
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $transaction): void {
            $lockedTransaction = Transaction::with('details.product')->lockForUpdate()->findOrFail($transaction->id);

            $this->authorize('update', $lockedTransaction);

            if ($lockedTransaction->isVoid()) {
                throw ValidationException::withMessages([
                    'items' => 'Transaksi void tidak dapat diubah.',
                ]);
            }

            foreach ($lockedTransaction->details as $detail) {
                if ($detail->product) {
                    $detail->product()->lockForUpdate()->first()?->increment('stok', $detail->qty);
                }
            }

            $total = 0;
            $discountTotal = 0;
            $newDetails = [];

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $qty = (int) $item['qty'];

                if (! $product->isActive()) {
                    throw ValidationException::withMessages([
                        'items' => "{$product->nama_barang} sedang nonaktif.",
                    ]);
                }

                if ($product->stok < $qty) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->nama_barang} tidak cukup. Tersedia {$product->stok} {$product->satuan}.",
                    ]);
                }

                $lineDiscount = min((int) ($item['discount_value'] ?? 0), $product->harga_jual);
                $subtotal = max(0, $product->harga_jual - $lineDiscount) * $qty;

                $discountTotal += $lineDiscount * $qty;
                $total += $subtotal;
                $newDetails[] = [
                    'product' => $product,
                    'qty' => $qty,
                    'harga' => $product->harga_jual,
                    'harga_modal' => $product->harga_modal,
                    'subtotal' => $subtotal,
                ];
            }

            $paymentType = $data['payment_type'];
            $uangDiterima = $lockedTransaction->payment_status === 'paid' && $paymentType === 'cash'
                ? (int) ($data['uang_diterima'] ?? 0)
                : ($lockedTransaction->payment_status === 'paid' ? $total : 0);

            if ($lockedTransaction->payment_status === 'paid' && $paymentType === 'cash' && $uangDiterima < $total) {
                throw ValidationException::withMessages([
                    'uang_diterima' => 'Uang diterima harus sama dengan atau lebih besar dari total transaksi.',
                ]);
            }

            $lockedTransaction->details()->delete();

            foreach ($newDetails as $detail) {
                $lockedTransaction->details()->create([
                    'product_id' => $detail['product']->id,
                    'qty' => $detail['qty'],
                    'harga' => $detail['harga'],
                    'harga_modal' => $detail['harga_modal'],
                    'subtotal' => $detail['subtotal'],
                ]);

                $detail['product']->decrement('stok', $detail['qty']);
            }

            $lockedTransaction->update([
                'created_at' => Carbon::parse($data['created_at']),
                'paid_at' => $lockedTransaction->payment_status === 'paid'
                    ? ($data['paid_at'] ?? $lockedTransaction->paid_at)
                    : null,
                'customer_name' => $data['customer_name'] ?? null,
                'payment_type' => $paymentType,
                'uang_diterima' => $uangDiterima,
                'total' => $total,
                'discount_total' => $discountTotal,
                'kembalian' => $paymentType === 'cash' ? max(0, $uangDiterima - $total) : 0,
            ]);

            AuditLog::record('transaction.updated', $lockedTransaction, [
                'kode_transaksi' => $lockedTransaction->kode_transaksi,
                'total' => $total,
                'discount_total' => $discountTotal,
            ]);
        });

        return redirect()
            ->route('dashboard', ['page' => 'transaction-history'])
            ->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function printThermal(Transaction $transaction, ThermalReceiptPrinter $thermalPrinter): RedirectResponse
    {
        $this->authorize('view', $transaction);

        try {
            $thermalPrinter->print($transaction, force: true);

            return redirect()->back()->with('success', 'Struk thermal berhasil dikirim ke printer.');
        } catch (Throwable $exception) {
            Log::warning('Thermal receipt reprint failed.', [
                'transaction_id' => $transaction->id,
                'kode_transaksi' => $transaction->kode_transaksi,
                'error' => $exception->getMessage(),
            ]);

            return redirect()->back()->with('warning', 'Struk thermal gagal dicetak. Periksa koneksi dan konfigurasi printer.');
        }
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorize('delete', $transaction);

        $data = request()->validate([
            'void_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($transaction, $data) {
            $lockedTransaction = Transaction::with('details.product')->lockForUpdate()->findOrFail($transaction->id);

            if ($lockedTransaction->isVoid()) {
                throw ValidationException::withMessages([
                    'void_reason' => 'Transaksi ini sudah dihapus.',
                ]);
            }

            foreach ($lockedTransaction->details as $detail) {
                if ($detail->product) {
                    $detail->product->increment('stok', $detail->qty);
                }
            }

            $lockedTransaction->update([
                'status' => 'void',
                'voided_at' => now(),
                'voided_by' => auth()->id(),
                'void_reason' => $data['void_reason'] ?? 'Dihapus oleh pengguna.',
            ]);

            AuditLog::record('transaction.voided', $lockedTransaction, [
                'kode_transaksi' => $lockedTransaction->kode_transaksi,
                'reason' => $lockedTransaction->void_reason,
                'total' => $lockedTransaction->total,
            ]);
        });

        return redirect()->back()->with('success', 'Transaksi berhasil dihapus dan stok dikembalikan.');
    }

    public function settle(SettleTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $transaction): void {
            $lockedTransaction = Transaction::lockForUpdate()->findOrFail($transaction->id);

            if ($lockedTransaction->payment_status !== 'pending') {
                throw ValidationException::withMessages([
                    'payment_status' => 'Transaksi ini sudah lunas dan tidak dapat diubah kembali.',
                ]);
            }

            $uangDiterima = $data['payment_type'] === 'cash'
                ? (int) ($data['uang_diterima'] ?? 0)
                : $lockedTransaction->total;

            if ($data['payment_type'] === 'cash' && $uangDiterima < $lockedTransaction->total) {
                throw ValidationException::withMessages([
                    'uang_diterima' => 'Uang diterima harus sama dengan atau lebih besar dari total transaksi.',
                ]);
            }

            $lockedTransaction->update([
                'payment_type' => $data['payment_type'],
                'payment_status' => 'paid',
                'uang_diterima' => $uangDiterima,
                'kembalian' => max(0, $uangDiterima - $lockedTransaction->total),
                'bank_name' => $data['payment_type'] === 'transfer' ? ($data['bank_name'] ?? null) : null,
                'reference_number' => $data['payment_type'] === 'transfer' ? ($data['reference_number'] ?? null) : null,
                'paid_at' => now(),
                'settled_by' => auth()->id(),
                'payment_verified_at' => $data['payment_type'] === 'transfer' && auth()->user()->isAdmin() ? now() : null,
                'payment_verified_by' => $data['payment_type'] === 'transfer' && auth()->user()->isAdmin() ? auth()->id() : null,
            ]);

            AuditLog::record('transaction.settled', $lockedTransaction, [
                'payment_type' => $lockedTransaction->payment_type,
                'total' => $lockedTransaction->total,
            ]);
        });

        return redirect()
            ->route('dashboard', ['page' => 'history'])
            ->with('success', 'Pembayaran berhasil dilunasi.');
    }

    public function verifyTransfer(VerifyTransferRequest $request, Transaction $transaction): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($transaction, $data, $request): void {
            $lockedTransaction = Transaction::lockForUpdate()->findOrFail($transaction->id);

            if ($lockedTransaction->payment_type !== 'transfer' || $lockedTransaction->payment_status !== 'paid') {
                throw ValidationException::withMessages([
                    'payment_type' => 'Hanya transaksi transfer lunas yang dapat diverifikasi.',
                ]);
            }

            if ($lockedTransaction->isVoid()) {
                throw ValidationException::withMessages([
                    'payment_type' => 'Transaksi void tidak dapat diverifikasi.',
                ]);
            }

            $lockedTransaction->update([
                'payment_verified_at' => now(),
                'payment_verified_by' => $request->user()->id,
            ]);

            PaymentVerification::create([
                'transaction_id' => $lockedTransaction->id,
                'user_id' => $request->user()->id,
                'verified_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            AuditLog::record('payment_transfer.verified', $lockedTransaction, [
                'kode_transaksi' => $lockedTransaction->kode_transaksi,
                'notes' => $data['notes'] ?? null,
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran transfer berhasil diverifikasi.');
    }

    private function nextCode(): string
    {
        $today = Carbon::today();
        $date = $today->toDateString();
        $prefix = 'TRX-'.$today->format('ymd').'-';
        $sequence = DB::table('transaction_sequences')
            ->where('date', $date)
            ->lockForUpdate()
            ->first();

        if (! $sequence) {
            $lastNumber = Transaction::whereDate('created_at', $today)
                ->where('kode_transaksi', 'like', $prefix.'%')
                ->pluck('kode_transaksi')
                ->map(fn (string $code): int => (int) substr(strrchr($code, '-'), 1))
                ->max() ?? 0;

            try {
                DB::table('transaction_sequences')->insert([
                    'date' => $date,
                    'last_number' => $lastNumber,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (QueryException) {
                //
            }

            $sequence = DB::table('transaction_sequences')
                ->where('date', $date)
                ->lockForUpdate()
                ->first();
        }

        $nextNumber = ((int) $sequence->last_number) + 1;

        DB::table('transaction_sequences')
            ->where('date', $date)
            ->update([
                'last_number' => $nextNumber,
                'updated_at' => now(),
            ]);

        return $prefix.str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function currentShiftForTransaction(): ?CashierShift
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return null;
        }

        return CashierShift::where('user_id', $user->id)
            ->open()
            ->latest('opened_at')
            ->first();
    }

    private function thermalReceiptPayload(Transaction $transaction): array
    {
        $transaction->loadMissing(['user', 'details.product']);
        $subtotal = (int) $transaction->details->sum(fn ($detail): int => (int) $detail->harga * (int) $detail->qty);
        $text = app(ThermalReceiptText::class)->text($transaction, feedLines: 1);

        return [
            'text' => $text,
            'rawbt_url' => 'rawbt:base64,'.base64_encode($text),
            'settings' => AppSetting::receiptSettings(),
            'transaction' => [
                'code' => $transaction->kode_transaksi,
                'created_at' => $transaction->created_at->format('d/m/Y H:i'),
                'cashier' => $transaction->user?->name ?? '-',
                'customer_name' => $transaction->customer_name,
                'payment_status' => $transaction->payment_status,
                'payment_type' => $transaction->payment_type,
                'status' => $transaction->status,
                'subtotal' => $subtotal,
                'discount_total' => (int) $transaction->discount_total,
                'total' => (int) $transaction->total,
                'uang_diterima' => (int) $transaction->uang_diterima,
                'kembalian' => (int) $transaction->kembalian,
            ],
            'items' => $transaction->details->map(fn ($detail): array => [
                'name' => $detail->product?->nama_barang ?? 'Produk dihapus',
                'qty' => (int) $detail->qty,
                'price' => (int) $detail->harga,
                'subtotal' => (int) $detail->subtotal,
            ])->values(),
        ];
    }

    private function receiptViewData(Request $request): array
    {
        $layout = $this->receiptLayout($request);

        return [
            'pdfMode' => false,
            'receiptLayout' => $layout,
            'receiptSizes' => $this->receiptSizes(),
        ];
    }

    private function receiptLayout(Request $request): array
    {
        $defaultSize = AppSetting::receiptSettings()['receipt_paper_width'] === '42' ? '80mm' : '58mm';
        $size = strtolower((string) $request->query('size', $defaultSize));
        $sizes = $this->receiptSizes();

        return $sizes[$size] ?? $sizes[$defaultSize];
    }

    private function receiptSizes(): array
    {
        return [
            '58mm' => [
                'size' => '58mm',
                'label' => '58mm Thermal',
                'paper' => [0, 0, 164.41, 841.89],
                'page_css' => '58mm 1000mm',
                'receipt_width' => '58mm',
                'receipt_padding' => '10px',
                'font_size' => '10.5px',
                'line_height' => '15px',
            ],
            '80mm' => [
                'size' => '80mm',
                'label' => '80mm Thermal',
                'paper' => [0, 0, 226.77, 841.89],
                'page_css' => '80mm 1000mm',
                'receipt_width' => '80mm',
                'receipt_padding' => '14px',
                'font_size' => '12px',
                'line_height' => '18px',
            ],
            'a5' => [
                'size' => 'a5',
                'label' => 'A5',
                'paper' => 'a5',
                'page_css' => 'A5',
                'receipt_width' => '132mm',
                'receipt_padding' => '18px',
                'font_size' => '12px',
                'line_height' => '18px',
            ],
            'a4' => [
                'size' => 'a4',
                'label' => 'A4',
                'paper' => 'a4',
                'page_css' => 'A4',
                'receipt_width' => '184mm',
                'receipt_padding' => '22px',
                'font_size' => '12px',
                'line_height' => '18px',
            ],
        ];
    }

    private function getFilteredTransactions(Request $request)
    {
        $filters = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'payment_status' => ['nullable', 'in:paid,pending'],
            'payment_type' => ['nullable', 'in:cash,transfer'],
        ]);

        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        $selectedUserId = $request->user()->isAdmin() ? ($filters['user_id'] ?? null) : null;
        $selectedPaymentStatus = $filters['payment_status'] ?? null;
        $selectedPaymentType = $filters['payment_type'] ?? null;

        $query = Transaction::visibleTo($request->user())->with(['user', 'details.product'])->latest();

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        }

        if ($selectedUserId) {
            $query->where('user_id', $selectedUserId);
        }

        if ($selectedPaymentStatus) {
            $query->where('payment_status', $selectedPaymentStatus);
        }

        if ($selectedPaymentType) {
            $query->where('payment_type', $selectedPaymentType);
        }

        return $query->get();
    }

    public function exportExcel(Request $request)
    {
        $transactions = $this->getFilteredTransactions($request);
        $filename = 'riwayat-transaksi-'.Carbon::now()->format('Ymd-His').'.xlsx';

        $rows = [];
        foreach ($transactions as $transaction) {
            $details = $transaction->details->map(fn ($d) => $d->product?->nama_barang.' ('.$d->qty.')')->implode('; ');
            $rows[] = [
                'Kode Transaksi' => $transaction->kode_transaksi,
                'Tanggal' => $transaction->created_at->format('Y-m-d H:i:s'),
                'Kasir' => $transaction->user?->name ?? 'Unknown',
                'Pelanggan' => $transaction->customer_name ?? '-',
                'Metode' => $transaction->payment_type,
                'Total' => $transaction->total,
                'Status' => $transaction->payment_status,
                'Status Transaksi' => $transaction->status,
                'Diskon' => $transaction->discount_total,
                'Item Detail' => $details,
            ];
        }

        return (new FastExcel(collect($rows)))->download($filename);
    }

    public function exportPdf(Request $request)
    {
        $transactions = $this->getFilteredTransactions($request);
        $pdf = Pdf::loadView('transactions.pdf', ['transactions' => $transactions]);

        return $pdf->download('riwayat-transaksi-'.Carbon::now()->format('Ymd-His').'.pdf');
    }
}
