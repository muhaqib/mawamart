<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Services\ThermalReceiptPrinter;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class PrintThermalReceipt
{
    use Queueable;

    public function __construct(
        public int $transactionId,
    ) {}

    public function handle(ThermalReceiptPrinter $thermalPrinter): void
    {
        $transaction = Transaction::with(['user', 'details.product'])->find($this->transactionId);

        if (! $transaction) {
            return;
        }

        try {
            $thermalPrinter->print($transaction);
        } catch (Throwable $exception) {
            Log::warning('Thermal receipt print failed.', [
                'transaction_id' => $transaction->id,
                'kode_transaksi' => $transaction->kode_transaksi,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
