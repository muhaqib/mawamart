<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function exportCsv(): Response
    {
        $filename = 'laporan-penjualan-'.Carbon::now()->format('Ymd-His').'.csv';
        $transactionsQuery = Transaction::with(['user', 'details.product'])->latest();

        $request = request();
        $filters = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'payment_status' => ['nullable', 'in:paid,pending'],
            'payment_type' => ['nullable', 'in:cash,transfer'],
        ]);

        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $transactionsQuery->whereBetween('created_at', [$start, $end]);
        }

        if (! empty($filters['user_id'])) {
            $transactionsQuery->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['payment_status'])) {
            $transactionsQuery->where('payment_status', $filters['payment_status']);
        }

        if (! empty($filters['payment_type'])) {
            $transactionsQuery->where('payment_type', $filters['payment_type']);
        }

        $transactions = $transactionsQuery->get();

        $rows = [
            ['No Transaksi', 'Tanggal', 'Kasir', 'Produk', 'Qty', 'Harga', 'Subtotal', 'Metode', 'Status Bayar', 'Status Transaksi', 'Diskon', 'Total'],
        ];

        foreach ($transactions as $transaction) {
            foreach ($transaction->details as $detail) {
                $rows[] = [
                    $transaction->kode_transaksi,
                    $transaction->created_at->format('Y-m-d H:i:s'),
                    $transaction->user->name,
                    $detail->product->nama_barang,
                    $detail->qty,
                    $detail->harga,
                    $detail->subtotal,
                    $transaction->payment_type,
                    $transaction->payment_status,
                    $transaction->status,
                    $transaction->discount_total,
                    $transaction->total,
                ];
            }
        }

        $content = collect($rows)->map(function (array $row): string {
            return implode(',', array_map(fn ($value) => '"'.str_replace('"', '""', (string) $value).'"', $row));
        })->implode("\n");

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
