<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Services\DashboardMetrics;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    public function test_profit_metrics_allow_negative_gross_profit(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $product = Product::create([
            'kode_barang' => 'BRG-RUGI',
            'nama_barang' => 'Produk Rugi',
            'kategori' => 'Minuman',
            'harga_modal' => 7000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);
        $transaction = Transaction::create([
            'kode_transaksi' => 'TRX-LOSS-0001',
            'user_id' => $admin->id,
            'created_at' => '2026-06-15 10:00:00',
            'total' => 5000,
            'payment_type' => 'cash',
            'uang_diterima' => 5000,
            'kembalian' => 0,
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);
        TransactionDetail::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'qty' => 1,
            'harga' => 5000,
            'harga_modal' => 7000,
            'subtotal' => 5000,
        ]);

        $metrics = app(DashboardMetrics::class);
        $transactions = Transaction::visibleTo($admin)
            ->whereBetween('created_at', [
                Carbon::parse('2026-06-01')->startOfDay(),
                Carbon::parse('2026-06-30')->endOfDay(),
            ])
            ->where('status', '!=', 'void')
            ->where('payment_status', 'paid');

        $this->assertSame(-2000, $metrics->transactionProfit(clone $transactions));
        $this->assertSame(-2000, $metrics->financialChart(
            $admin,
            Carbon::parse('2026-06-15'),
            Carbon::parse('2026-06-15'),
        )->first()['gross_profit']);

        $product->update(['harga_modal' => 1000]);

        $this->assertSame(-2000, $metrics->transactionProfit(clone $transactions));
        $this->assertSame(7000, $metrics->transactionCapital(clone $transactions));
    }
}
