<?php

namespace Tests\Feature;

use App\Models\CashierShift;
use App\Models\Expense;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CashierReportAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_history_contains_all_transactions(): void
    {
        $cashier = $this->cashier('cashier-one');
        $otherCashier = $this->cashier('cashier-two');
        $ownTransaction = $this->transaction($cashier, 'TRX-OWN-0001', 100000);
        $otherTransaction = $this->transaction($otherCashier, 'TRX-OTHER-0001', 900000);

        $response = $this->actingAs($cashier)->get('/?'.http_build_query([
            'page' => 'history',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'user_id' => $otherCashier->id,
        ]));

        $response->assertOk()->assertSee('dalwa-react-root');

        $props = $this->reactProps($response);
        $this->assertFalse($props['user']['isAdmin']);
        $codes = array_column($props['historyTransactions'], 'kode_transaksi');
        $this->assertContains($ownTransaction->kode_transaksi, $codes);
        $this->assertContains($otherTransaction->kode_transaksi, $codes);
        $this->assertNotNull($props['routes']['transactionsExportExcel']);
    }

    public function test_cashier_can_open_all_receipts(): void
    {
        $cashier = $this->cashier('cashier-one');
        $otherCashier = $this->cashier('cashier-two');
        $ownTransaction = $this->transaction($cashier, 'TRX-OWN-0001', 100000);
        $otherTransaction = $this->transaction($otherCashier, 'TRX-OTHER-0001', 900000);

        $this->actingAs($cashier)
            ->get(route('transactions.receipt', $ownTransaction))
            ->assertOk();

        $this->actingAs($cashier)
            ->get(route('transactions.receipt', $otherTransaction))
            ->assertOk();
    }

    public function test_cashier_can_export_and_delete_own_transaction_directly(): void
    {
        $cashier = $this->cashier('cashier-one');
        $transaction = $this->transaction($cashier, 'TRX-OWN-0001', 100000);

        $this->actingAs($cashier)
            ->get(route('transactions.export-excel'))
            ->assertOk();

        $this->actingAs($cashier)
            ->delete(route('transactions.destroy', $transaction))
            ->assertRedirect();

        $this->assertSame('void', $transaction->fresh()->status);
        $this->assertSame($cashier->id, $transaction->fresh()->voided_by);
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_admin_can_view_another_cashiers_receipt(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $cashier = $this->cashier('cashier-one');
        $transaction = $this->transaction($cashier, 'TRX-CASHIER-0001', 100000);

        $this->actingAs($admin)
            ->get(route('transactions.receipt', $transaction))
            ->assertOk();
    }

    public function test_transaction_receipt_can_be_reprinted_to_thermal_connector(): void
    {
        $cashier = $this->cashier('cashier-one');
        $transaction = $this->transaction($cashier, 'TRX-PRINT-0001', 100000);
        $path = storage_path('framework/testing/thermal-receipt.prn');

        File::ensureDirectoryExists(dirname($path));
        File::delete($path);
        config([
            'thermal.connector' => 'file',
            'thermal.printer_name' => $path,
            'thermal.width' => 32,
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.thermal-receipt', $transaction))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertFileExists($path);
        $this->assertStringContainsString('TOKO MAWA', File::get($path));
    }

    public function test_cashier_navigation_is_simple_and_profile_is_read_only(): void
    {
        $cashier = $this->cashier('cashier-one');

        $response = $this->actingAs($cashier)
            ->get('/')
            ->assertOk()
            ->assertSee('dalwa-react-root');

        $props = $this->reactProps($response);
        $this->assertFalse($props['user']['isAdmin']);
        $this->assertSame('cashier', $props['user']['role']);
        $this->assertNotNull($props['routes']['transactionsExportExcel']);
        $this->assertArrayNotHasKey('approvalRequests', $props);

        $this->actingAs($cashier)
            ->put(route('profile.update'), [
                'name' => 'Nama Baru',
                'username' => 'username-baru',
                'email' => 'baru@example.com',
            ])
            ->assertForbidden();
    }

    public function test_cashier_can_change_their_own_password(): void
    {
        $cashier = $this->cashier('cashier-one');

        $this->actingAs($cashier)
            ->put(route('password.update'), [
                'current_password' => 'password',
                'password' => 'password-baru',
                'password_confirmation' => 'password-baru',
            ])
            ->assertRedirect(route('dashboard', ['page' => 'account']));

        $this->assertTrue(Hash::check('password-baru', $cashier->fresh()->password));
    }

    public function test_admin_navigation_keeps_management_features(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)
            ->get('/')
            ->assertOk()
            ->assertSee('dalwa-react-root');

        $props = $this->reactProps($response);
        $this->assertTrue($props['user']['isAdmin']);
        $this->assertSame('admin', $props['user']['role']);
        $this->assertNotNull($props['routes']['transactionsExportExcel']);
    }

    public function test_cashier_can_create_an_unpaid_transaction(): void
    {
        $cashier = $this->cashier('cashier-one');
        $product = Product::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'items' => [['product_id' => $product->id, 'qty' => 2]],
                'payment_type' => null,
                'payment_status' => 'pending',
                'discount_per_product' => 0,
                'customer_name' => 'Pelanggan Tempo',
            ])
            ->assertRedirect();

        $transaction = Transaction::sole();
        $this->assertSame('pending', $transaction->payment_status);
        $this->assertNull($transaction->payment_type);
        $this->assertNull($transaction->paid_at);
        $this->assertNull($transaction->settled_by);
    }

    public function test_inactive_authenticated_cashier_is_blocked(): void
    {
        $cashier = $this->cashier('cashier-one');
        $cashier->update(['status' => 'inactive']);

        $this->actingAs($cashier)
            ->get('/')
            ->assertForbidden();

        $product = Product::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'items' => [['product_id' => $product->id, 'qty' => 1]],
                'payment_type' => 'cash',
                'payment_status' => 'paid',
                'uang_diterima' => 5000,
            ])
            ->assertForbidden();
    }

    public function test_discount_cannot_exceed_product_selling_price(): void
    {
        $cashier = $this->cashier('cashier-one');
        $product = Product::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'items' => [['product_id' => $product->id, 'qty' => 1]],
                'payment_type' => 'cash',
                'payment_status' => 'paid',
                'discount_per_product' => 6000,
                'uang_diterima' => 5000,
            ])
            ->assertSessionHasErrors('discount_per_product');

        $this->assertSame(10, $product->fresh()->stok);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_transaction_code_sequence_continues_from_existing_transactions(): void
    {
        $cashier = $this->cashier('cashier-one');
        $prefix = 'TRX-'.now()->format('ymd').'-';
        $this->transaction($cashier, $prefix.'0009', 100000);
        $product = Product::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'items' => [['product_id' => $product->id, 'qty' => 1]],
                'payment_type' => 'cash',
                'payment_status' => 'paid',
                'uang_diterima' => 5000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transactions', [
            'kode_transaksi' => $prefix.'0010',
        ]);
    }

    public function test_cashier_can_settle_their_own_unpaid_transaction_once(): void
    {
        $cashier = $this->cashier('cashier-one');
        $transaction = Transaction::create([
            'kode_transaksi' => 'TRX-PENDING-0001',
            'user_id' => $cashier->id,
            'total' => 100000,
            'payment_type' => null,
            'payment_status' => 'pending',
            'uang_diterima' => 0,
            'kembalian' => 0,
        ]);

        $this->actingAs($cashier)
            ->put(route('transactions.settle', $transaction), [
                'payment_type' => 'cash',
                'uang_diterima' => 120000,
            ])
            ->assertRedirect(route('dashboard', ['page' => 'history']));

        $transaction->refresh();
        $this->assertSame('paid', $transaction->payment_status);
        $this->assertSame('cash', $transaction->payment_type);
        $this->assertSame(20000, $transaction->kembalian);
        $this->assertSame($cashier->id, $transaction->settled_by);
        $this->assertNotNull($transaction->paid_at);

        $this->actingAs($cashier)
            ->put(route('transactions.settle', $transaction), [
                'payment_type' => 'transfer',
            ])
            ->assertSessionHasErrors('payment_status');

        $this->assertSame('cash', $transaction->fresh()->payment_type);
    }

    public function test_cashier_cannot_settle_another_cashiers_transaction(): void
    {
        $cashier = $this->cashier('cashier-one');
        $otherCashier = $this->cashier('cashier-two');
        $transaction = Transaction::create([
            'kode_transaksi' => 'TRX-PENDING-0001',
            'user_id' => $otherCashier->id,
            'total' => 100000,
            'payment_type' => null,
            'payment_status' => 'pending',
            'uang_diterima' => 0,
            'kembalian' => 0,
        ]);

        $this->actingAs($cashier)
            ->put(route('transactions.settle', $transaction), [
                'payment_type' => 'cash',
                'uang_diterima' => 100000,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_settle_any_cashiers_unpaid_transaction(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $cashier = $this->cashier('cashier-one');
        $transaction = Transaction::create([
            'kode_transaksi' => 'TRX-PENDING-0001',
            'user_id' => $cashier->id,
            'total' => 100000,
            'payment_type' => null,
            'payment_status' => 'pending',
            'uang_diterima' => 0,
            'kembalian' => 0,
        ]);

        $this->actingAs($admin)
            ->put(route('transactions.settle', $transaction), [
                'payment_type' => 'transfer',
                'bank_name' => 'BSI',
                'reference_number' => 'REF-001',
            ])
            ->assertRedirect(route('dashboard', ['page' => 'history']));

        $transaction->refresh();
        $this->assertSame('paid', $transaction->payment_status);
        $this->assertSame('transfer', $transaction->payment_type);
        $this->assertSame($admin->id, $transaction->settled_by);
    }

    public function test_transaction_export_links_include_the_active_filters(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $cashier = $this->cashier('cashier-one');
        $requestFilters = [
            'period_month' => '2026-06',
            'user_id' => $cashier->id,
            'payment_status' => 'paid',
        ];
        $exportFilters = [
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-30',
            'user_id' => $cashier->id,
            'payment_status' => 'paid',
        ];

        $response = $this->actingAs($admin)
            ->get('/?'.http_build_query(['page' => 'history', ...$requestFilters]))
            ->assertOk();

        $props = $this->reactProps($response);
        $this->assertSame(route('transactions.export-excel', $exportFilters), $props['routes']['transactionsExportExcel']);
        $this->assertSame(route('transactions.export-pdf', $exportFilters), $props['routes']['transactionsExportPdf']);
    }

    public function test_purchase_history_uses_the_selected_date_range(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $product = Product::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);
        StockIn::create(['product_id' => $product->id, 'qty' => 10, 'supplier' => 'Supplier Juni', 'tanggal' => '2026-06-15']);
        StockIn::create(['product_id' => $product->id, 'qty' => 20, 'supplier' => 'Supplier Mei', 'tanggal' => '2026-05-15']);

        $response = $this->actingAs($admin)
            ->get('/?'.http_build_query([
                'page' => 'purchase-history',
                'start_date' => '2026-06-01',
                'end_date' => '2026-06-30',
            ]));

        $response->assertOk()->assertSee('dalwa-react-root');
        $props = $this->reactProps($response);
        $this->assertCount(1, $props['purchaseHistory']);
        $this->assertSame('Supplier Juni', $props['purchaseHistory'][0]['supplier']);

        $purchaseHistory = $response->viewData('purchaseHistory');
        $this->assertTrue($purchaseHistory->contains('supplier', 'Supplier Juni'));
        $this->assertFalse($purchaseHistory->contains('supplier', 'Supplier Mei'));
    }

    public function test_admin_can_create_expense_and_dashboard_payload_uses_expenses(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->post(route('expenses.store'), [
                'spent_at' => '2026-10-09',
                'uraian' => 'Bayar listrik toko',
                'volume' => 1,
                'unit' => 'Bulan',
                'price' => 850000,
                'notes' => 'Tagihan Oktober',
            ])
            ->assertRedirect(route('dashboard', [
                'page' => 'operations',
                'start_date' => '2026-10-09',
                'end_date' => '2026-10-09',
            ]));

        $this->assertDatabaseHas('expenses', [
            'user_id' => $admin->id,
            'category' => 'Operasional',
            'description' => 'Bayar listrik toko',
            'uraian' => 'Bayar listrik toko',
            'unit' => 'Bulan',
            'price' => 850000,
            'amount' => 850000,
        ]);

        Expense::create([
            'user_id' => $admin->id,
            'spent_at' => '2026-09-30',
            'category' => 'Sewa',
            'description' => 'Sewa lama',
            'uraian' => 'Sewa lama',
            'volume' => 1,
            'unit' => 'Bulan',
            'price' => 5000000,
            'amount' => 5000000,
        ]);

        $response = $this->actingAs($admin)
            ->get('/?'.http_build_query([
                'page' => 'operations',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-31',
            ]))
            ->assertOk();

        $props = $this->reactProps($response);
        $this->assertCount(1, $props['expenses']);
        $this->assertSame('Operasional', $props['expenses'][0]['category']);
        $this->assertSame(850000, $props['expenses'][0]['amount']);
        $this->assertSame(route('expenses.store'), $props['routes']['expensesStore']);
        $this->assertSame(route('expenses.print', [
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
        ]), $props['routes']['expensesPrint']);
        $this->assertSame(route('expenses.update', Expense::where('uraian', 'Bayar listrik toko')->first()), $props['expenses'][0]['update_url']);
        $this->assertSame(route('expenses.destroy', Expense::where('uraian', 'Bayar listrik toko')->first()), $props['expenses'][0]['destroy_url']);
    }

    public function test_admin_can_update_delete_and_print_expenses(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
            'status' => 'active',
        ]);
        $expense = Expense::create([
            'user_id' => $admin->id,
            'spent_at' => '2026-10-09',
            'category' => 'Listrik',
            'description' => 'Bayar listrik toko',
            'uraian' => 'Bayar listrik toko',
            'volume' => 1,
            'unit' => 'Bulan',
            'price' => 850000,
            'amount' => 850000,
        ]);

        $this->actingAs($admin)
            ->put(route('expenses.update', $expense), [
                'spent_at' => '2026-10-10',
                'uraian' => 'Biaya operasional toko',
                'volume' => 1,
                'unit' => 'Bulan',
                'price' => 950000,
            ])
            ->assertRedirect(route('dashboard', ['page' => 'operations']));

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'spent_at' => '2026-10-10 00:00:00',
            'category' => 'Operasional',
            'description' => 'Biaya operasional toko',
            'uraian' => 'Biaya operasional toko',
            'unit' => 'Bulan',
            'price' => 950000,
            'amount' => 950000,
        ]);

        $this->actingAs($admin)
            ->get(route('expenses.print', [
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-31',
            ]))
            ->assertOk()
            ->assertSee('Laporan Pengeluaran Toko')
            ->assertSee('Biaya operasional toko');

        $this->actingAs($admin)
            ->delete(route('expenses.destroy', $expense))
            ->assertRedirect(route('dashboard', ['page' => 'operations']));

        $this->assertDatabaseMissing('expenses', [
            'id' => $expense->id,
        ]);
    }

    private function cashier(string $username): User
    {
        $cashier = User::factory()->create([
            'username' => $username,
            'role' => 'cashier',
            'status' => 'active',
        ]);

        CashierShift::create([
            'user_id' => $cashier->id,
            'opened_at' => now(),
            'opening_cash' => 0,
        ]);

        return $cashier;
    }

    private function transaction(User $user, string $code, int $total): Transaction
    {
        return Transaction::create([
            'kode_transaksi' => $code,
            'user_id' => $user->id,
            'total' => $total,
            'payment_type' => 'cash',
            'uang_diterima' => $total,
            'kembalian' => 0,
            'payment_status' => 'paid',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function reactProps(TestResponse $response): array
    {
        preg_match("/window\\.__DALWA_APP__ = JSON\\.parse\\('(.+)'\\);/s", $response->getContent(), $matches);

        $this->assertNotEmpty($matches, 'React props were not rendered.');

        $json = json_decode('"'.$matches[1].'"', true, flags: JSON_THROW_ON_ERROR);

        return json_decode($json, true, flags: JSON_THROW_ON_ERROR);
    }
}
