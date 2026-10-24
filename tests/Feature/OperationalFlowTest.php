<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockIn;
use App\Models\StockOpname;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class OperationalFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_core_operational_flow_is_working(): void
    {
        Carbon::setTestNow('2026-10-13 10:00:00');

        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $cashier = User::factory()->create([
            'username' => 'kasir',
            'role' => 'cashier',
            'status' => 'active',
        ]);
        $product = Product::create([
            'kode_barang' => 'DW-001',
            'nama_barang' => 'DWater Botol 1.500ml',
            'kategori' => 'Air Mineral',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'items' => [['product_id' => $product->id, 'qty' => 2]],
                'payment_type' => 'cash',
                'payment_status' => 'paid',
                'uang_diterima' => 10000,
                'customer_name' => 'Pelanggan Smoke',
            ])
            ->assertRedirect(route('dashboard', ['page' => 'transactions']));

        $transaction = Transaction::with('details')->sole();
        $this->assertSame(10000, $transaction->total);
        $this->assertSame(8, $product->fresh()->stok);

        $this->actingAs($cashier)
            ->get(route('transactions.receipt', ['transaction' => $transaction, 'size' => '58mm']))
            ->assertOk()
            ->assertSee('TOKO MAWA')
            ->assertSee('Cetak dari Perangkat Ini')
            ->assertSee('Kembali')
            ->assertSee('Cetak RawBT Android')
            ->assertSee('58mm Thermal')
            ->assertDontSee('Cetak Thermal')
            ->assertDontSee('Download PDF')
            ->assertDontSee('Download JPEG');

        $pdfResponse = $this->actingAs($cashier)
            ->get(route('transactions.receipt-pdf', ['transaction' => $transaction, 'size' => 'a5']))
            ->assertOk();

        $this->assertStringStartsWith('%PDF', $pdfResponse->getContent());

        $thermalPath = storage_path('framework/testing/operational-flow-receipt.prn');
        File::ensureDirectoryExists(dirname($thermalPath));
        File::delete($thermalPath);
        config([
            'thermal.connector' => 'file',
            'thermal.printer_name' => $thermalPath,
            'thermal.width' => 32,
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.thermal-receipt', $transaction))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertFileExists($thermalPath);

        $this->actingAs($cashier)
            ->put(route('transactions.update', $transaction), [
                'created_at' => '2026-10-13 10:15',
                'customer_name' => 'Pelanggan Smoke Edit',
                'payment_type' => 'cash',
                'uang_diterima' => 5000,
                'items' => [['product_id' => $product->id, 'qty' => 1]],
            ])
            ->assertRedirect(route('dashboard', ['page' => 'transaction-history']));

        $this->assertSame(5000, $transaction->fresh()->total);
        $this->assertSame(9, $product->fresh()->stok);

        $this->actingAs($admin)
            ->post(route('expenses.store'), [
                'spent_at' => '2026-10-13',
                'uraian' => 'Solar operasional',
                'volume' => 1,
                'unit' => 'Kali',
                'price' => 150000,
                'notes' => 'Smoke test',
            ])
            ->assertRedirect(route('dashboard', [
                'page' => 'operations',
                'start_date' => '2026-10-13',
                'end_date' => '2026-10-13',
            ]));

        $expense = Expense::sole();
        $this->actingAs($admin)
            ->put(route('expenses.update', $expense), [
                'spent_at' => '2026-10-13',
                'uraian' => 'Solar operasional edit',
                'volume' => 2,
                'unit' => 'Kali',
                'price' => 100000,
                'notes' => 'Smoke test edit',
            ])
            ->assertRedirect(route('dashboard', ['page' => 'operations']));

        $this->assertSame(200000, $expense->fresh()->amount);

        $this->actingAs($admin)
            ->get(route('expenses.print', [
                'start_date' => '2026-10-13',
                'end_date' => '2026-10-13',
            ]))
            ->assertOk()
            ->assertSee('Solar operasional edit');

        $this->actingAs($admin)
            ->post(route('stock-ins.store'), [
                'tanggal' => '2026-10-13',
                'product_id' => $product->id,
                'qty' => 5,
                'supplier' => 'Supplier Smoke',
                'harga_beli' => 3000,
                'harga_jual' => 5000,
            ])
            ->assertRedirect(route('dashboard', ['page' => 'purchases']));

        $this->assertSame(14, $product->fresh()->stok);
        $this->assertDatabaseHas('stock_ins', [
            'product_id' => $product->id,
            'qty' => 5,
            'supplier' => 'Supplier Smoke',
        ]);

        $this->actingAs($admin)
            ->post(route('stock-opnames.store'), [
                'product_id' => $product->id,
                'actual_stock' => 20,
                'reason' => 'Penyesuaian smoke test',
                'opname_date' => '2026-10-13',
            ])
            ->assertRedirect(route('dashboard', ['page' => 'stock-opname']));

        $this->assertSame(20, $product->fresh()->stok);
        $this->assertSame(1, StockIn::count());
        $this->assertSame(1, StockOpname::count());
        $this->assertSame(6, StockAdjustment::sole()->difference);

        foreach (['transactions', 'transaction-history', 'operations', 'purchases', 'stock-opname', 'stock', 'history'] as $page) {
            $this->actingAs($admin)
                ->get('/?'.http_build_query([
                    'page' => $page,
                    'period_month' => '2026-10',
                    'start_date' => '2026-10-13',
                    'end_date' => '2026-10-13',
                ]))
                ->assertOk()
                ->assertSee('dalwa-react-root');
        }
    }
}
