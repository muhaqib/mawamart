<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOpname;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecordOwnershipAndDatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Category::firstOrCreate(['nama_kategori' => $this->productPayload()['kategori']]);
    }

    public function test_other_cashier_cannot_edit_or_delete_in_any_crud_menu(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $records = $this->records($owner);

        foreach ($records as [$record, $route, $payload]) {
            $before = $record->fresh()->getAttributes();
            $this->actingAs($other)->putJson(route($route.'.update', $record), $payload)->assertForbidden();
            $this->actingAs($other)->deleteJson(route($route.'.destroy', $record))->assertForbidden();
            $this->assertEquals($before, $record->fresh()->getAttributes());
        }

        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_cashier_can_directly_edit_and_delete_own_records_while_keeping_the_original_owner(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $records = $this->records($owner);

        foreach ($records as [$record, $route, $payload]) {
            $this->actingAs($owner)->put(route($route.'.update', $record), $payload + ['user_id' => $other->id])
                ->assertRedirect()->assertSessionHasNoErrors();
            $this->assertSame($owner->id, (int) $record->fresh()->user_id);
        }

        foreach (array_reverse($records) as [$record, $route]) {
            $this->actingAs($owner)->delete(route($route.'.destroy', $record))
                ->assertRedirect()->assertSessionHasNoErrors();

            if ($record instanceof Transaction) {
                $this->assertSame('void', $record->fresh()->status);
            } elseif ($record instanceof Product) {
                $this->assertSame('inactive', $record->fresh()->status);
            } else {
                $this->assertNull($record->fresh());
            }
        }

        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_admin_can_edit_and_delete_every_record_regardless_of_owner(): void
    {
        $owner = $this->user();
        $admin = $this->user('admin');
        $records = $this->records($owner);
        foreach ($records as [$record, $route, $payload]) {
            $this->actingAs($admin)->put(route($route.'.update', $record), $payload)
                ->assertRedirect()->assertSessionHasNoErrors();
            $this->assertSame($owner->id, (int) $record->fresh()->user_id);
        }
        foreach (array_reverse($records) as [$record, $route]) {
            $this->actingAs($admin)->delete(route($route.'.destroy', $record))
                ->assertRedirect()->assertSessionHasNoErrors();
        }
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_creator_is_recorded_from_the_authenticated_account_on_create(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $this->actingAs($owner);
        $productPayload = $this->productPayload();
        $this->post(route('products.store'), $productPayload + ['user_id' => $other->id])->assertRedirect();
        $this->post(route('categories.store'), ['nama_kategori' => 'Kategori baru', 'user_id' => $other->id])->assertRedirect();
        $this->post(route('suppliers.store'), ['nama' => 'Suplier baru', 'user_id' => $other->id])->assertRedirect();
        $this->post(route('stock-ins.store'), [
            'tanggal' => '2026-10-01', 'product_id' => Product::sole()->id, 'qty' => 2, 'user_id' => $other->id,
        ])->assertRedirect();
        foreach ([Product::class, Category::class, Supplier::class, StockIn::class] as $model) {
            $this->assertSame($owner->id, (int) $model::where('user_id', $owner->id)->sole()->user_id);
        }
    }

    public function test_legacy_owners_are_recovered_from_creation_audits_only(): void
    {
        $owner = $this->user();
        $this->actingAs($owner);
        $record = Product::create($this->productPayload());
        AuditLog::record('product.created', $record);
        $unknown = Category::create(['nama_kategori' => 'Tanpa audit pembuat']);
        $migration = require database_path('migrations/2026_10_18_000001_add_record_owners.php');
        $migration->down();
        $migration->up();

        $this->assertSame($owner->id, (int) $record->fresh()->user_id);
        $this->assertNull($unknown->fresh()->user_id);
        $this->assertFalse($owner->can('update', $unknown->fresh()));
        $this->assertTrue($this->user('admin')->can('update', $unknown->fresh()));
    }

    public function test_dashboard_action_urls_follow_record_ownership(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $this->records($owner);
        foreach (['inventory' => 'products', 'categories' => 'categories', 'suppliers' => 'suppliers', 'purchases' => 'stockEntries', 'operations' => 'expenses', 'transaction-history' => 'historyTransactions'] as $page => $collection) {
            foreach ([$owner, $other, $this->user('admin')] as $viewer) {
                $response = $this->actingAs($viewer)->get(route('dashboard', ['page' => $page]))->assertOk();
                preg_match("/window\\.__DALWA_APP__ = JSON\\.parse\\('(.+)'\\);/s", $response->getContent(), $matches);
                $props = json_decode(json_decode('"'.$matches[1].'"', true, flags: JSON_THROW_ON_ERROR), true, flags: JSON_THROW_ON_ERROR);
                $this->assertNotEmpty($props[$collection]);
                $canManage = $viewer->isAdmin() || $viewer->is($owner);
                $this->assertSame($canManage, $props[$collection][0]['update_url'] !== null);
                $this->assertSame($canManage, $props[$collection][0]['destroy_url'] !== null);
            }
        }
    }

    public function test_transaction_dates_can_be_entered_and_corrected_directly_by_the_owner(): void
    {
        $owner = $this->user();
        $this->actingAs($owner);
        $product = Product::create($this->productPayload());
        $this->postJson(route('transactions.store'), [
            'created_at' => '2026-09-15T08:30', 'items' => [['product_id' => $product->id, 'qty' => 1]],
            'payment_type' => 'cash', 'payment_status' => 'paid', 'uang_diterima' => 5000,
        ])->assertOk();
        $transaction = Transaction::sole();
        $this->assertSame('2026-09-15 08:30', $transaction->created_at->format('Y-m-d H:i'));
        $this->assertSame('2026-09-15 08:30', $transaction->paid_at->format('Y-m-d H:i'));
        $this->put(route('transactions.update', $transaction), [
            'created_at' => '2026-09-16T09:45', 'paid_at' => '2026-09-17T10:20',
            'items' => [['product_id' => $product->id, 'qty' => 1]], 'payment_type' => 'cash', 'uang_diterima' => 5000,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame('2026-09-16 09:45', $transaction->fresh()->created_at->format('Y-m-d H:i'));
        $this->assertSame('2026-09-17 10:20', $transaction->fresh()->paid_at->format('Y-m-d H:i'));
        $this->assertSame(9, $product->fresh()->stok);
    }

    public function test_opname_date_correction_enforces_ownership_without_changing_stock(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $this->actingAs($owner);
        $product = Product::create($this->productPayload());
        $this->post(route('stock-opnames.store'), [
            'product_id' => $product->id, 'actual_stock' => 12, 'reason' => 'Hitung fisik', 'opname_date' => '2026-10-01',
        ])->assertSessionHasNoErrors();
        $opname = StockOpname::sole();
        $this->actingAs($other)->putJson(route('stock-opnames.update-date', $opname), ['opname_date' => '2026-10-02'])->assertForbidden();
        $this->actingAs($owner)->put(route('stock-opnames.update-date', $opname), ['opname_date' => '2026-10-02'])->assertSessionHasNoErrors();
        $this->assertSame('2026-10-02', $opname->fresh()->opname_date->toDateString());
        $this->assertSame(12, $product->fresh()->stok);
    }

    public function test_admin_can_edit_and_delete_full_stock_opname_without_losing_later_stock_changes(): void
    {
        $owner = $this->user();
        $admin = $this->user('admin');
        $this->actingAs($owner);
        $product = Product::create($this->productPayload());
        $this->post(route('stock-opnames.store'), [
            'product_id' => $product->id,
            'actual_stock' => 7,
            'reason' => 'Hitung awal',
            'opname_date' => '2026-10-01',
        ])->assertSessionHasNoErrors();
        $opname = StockOpname::with('adjustments')->sole();
        $adjustment = $opname->adjustments->sole();
        $product->increment('stok', 3);

        $this->actingAs($admin)->put(route('stock-opnames.update', $opname), [
            'adjustment_id' => $adjustment->id,
            'product_id' => $product->id,
            'actual_stock' => 9,
            'reason' => 'Hitung ulang',
            'opname_date' => '2026-10-02',
        ])->assertSessionHasNoErrors();

        $this->assertSame(12, $product->fresh()->stok);
        $this->assertSame('2026-10-02', $opname->fresh()->opname_date->toDateString());
        $this->assertDatabaseHas('stock_adjustments', [
            'id' => $adjustment->id,
            'system_stock' => 10,
            'actual_stock' => 9,
            'difference' => -1,
            'reason' => 'Hitung ulang',
        ]);

        $this->actingAs($admin)
            ->delete(route('stock-opnames.destroy', $opname))
            ->assertSessionHasNoErrors();

        $this->assertSame(13, $product->fresh()->stok);
        $this->assertDatabaseMissing('stock_opnames', ['id' => $opname->id]);
        $this->assertDatabaseMissing('stock_adjustments', ['id' => $adjustment->id]);
    }

    public function test_cashier_can_directly_edit_and_delete_own_full_opname(): void
    {
        $owner = $this->user();
        $other = $this->user();
        $this->actingAs($owner);
        $product = Product::create($this->productPayload());
        $this->post(route('stock-opnames.store'), [
            'product_id' => $product->id,
            'actual_stock' => 8,
            'reason' => 'Hitung awal',
            'opname_date' => '2026-10-01',
        ])->assertSessionHasNoErrors();
        $opname = StockOpname::with('adjustments')->sole();
        $adjustment = $opname->adjustments->sole();
        $payload = [
            'adjustment_id' => $adjustment->id,
            'product_id' => $product->id,
            'actual_stock' => 6,
            'reason' => 'Koreksi kasir',
            'opname_date' => '2026-10-03',
        ];

        $this->actingAs($other)->putJson(route('stock-opnames.update', $opname), $payload)->assertForbidden();
        $this->actingAs($other)->deleteJson(route('stock-opnames.destroy', $opname))->assertForbidden();

        $this->actingAs($owner)->put(route('stock-opnames.update', $opname), $payload)
            ->assertSessionHasNoErrors();
        $this->assertSame(6, $product->fresh()->stok);
        $this->assertSame('Koreksi kasir', $adjustment->fresh()->reason);

        $this->actingAs($owner)->delete(route('stock-opnames.destroy', $opname))
            ->assertSessionHasNoErrors();
        $this->assertSame(10, $product->fresh()->stok);
        $this->assertDatabaseMissing('stock_opnames', ['id' => $opname->id]);
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_purchase_and_expense_dates_are_saved_directly_for_the_owner(): void
    {
        $owner = $this->user();
        foreach ($this->records($owner) as [$record, $route, $payload]) {
            if (! in_array($route, ['stock-ins', 'expenses'], true)) {
                continue;
            }
            $payload = array_replace($payload, $route === 'stock-ins'
                ? ['tanggal' => '2026-09-12', 'expired_at' => '2027-01-20'] : ['spent_at' => '2026-09-13']);
            $this->actingAs($owner)->put(route($route.'.update', $record), $payload)->assertSessionHasNoErrors();
            if ($record instanceof StockIn) {
                $this->assertSame('2026-09-12', $record->fresh()->tanggal->toDateString());
                $this->assertSame('2027-01-20', $record->fresh()->expired_at->toDateString());
            } else {
                $this->assertSame('2026-09-13', $record->fresh()->spent_at->toDateString());
            }
        }
    }

    public function test_invalid_dates_are_rejected_without_changing_records(): void
    {
        $owner = $this->user();
        foreach ($this->records($owner) as [$record, $route, $payload]) {
            $field = match ($route) {
                'stock-ins' => 'tanggal',
                'expenses' => 'spent_at',
                'transactions' => 'created_at',
                default => null,
            };
            if ($field === null) {
                continue;
            }
            $this->putJson(route($route.'.update', $record), array_replace($payload, [$field => '31/02/2026']))
                ->assertUnprocessable()->assertJsonValidationErrors($field);
        }
        $this->assertDatabaseCount('approval_requests', 0);
    }

    private function records(User $owner): array
    {
        $this->actingAs($owner);
        $product = Product::create($this->productPayload());
        $category = Category::create(['nama_kategori' => 'Kategori terpisah']);
        $supplier = Supplier::create(['nama' => 'Suplier awal']);
        $stock = StockIn::create(['product_id' => $product->id, 'tanggal' => now(), 'qty' => 1]);
        $expensePayload = ['spent_at' => now()->toDateString(), 'uraian' => 'Ongkir', 'volume' => 1, 'unit' => 'Kali', 'price' => 10000];
        $expense = Expense::create($expensePayload + ['user_id' => $owner->id, 'category' => 'Operasional', 'description' => 'Ongkir', 'amount' => 10000]);
        $transaction = Transaction::create(['user_id' => $owner->id, 'kode_transaksi' => 'TRX-OWN', 'total' => 5000, 'payment_type' => 'cash', 'payment_status' => 'paid', 'status' => 'completed', 'uang_diterima' => 5000]);

        return [
            [$product, 'products', array_replace($this->productPayload(), ['nama_barang' => 'Produk diperbarui'])],
            [$category, 'categories', ['nama_kategori' => 'Kategori diperbarui']],
            [$supplier, 'suppliers', ['nama' => 'Suplier diperbarui']],
            [$stock, 'stock-ins', ['tanggal' => now()->toDateString(), 'product_id' => $product->id, 'qty' => 1, 'harga_beli' => 3000, 'harga_jual' => 5000]],
            [$expense, 'expenses', $expensePayload],
            [$transaction, 'transactions', ['created_at' => now()->format('Y-m-d\TH:i'), 'payment_type' => 'cash', 'uang_diterima' => 5000, 'items' => [['product_id' => $product->id, 'qty' => 1]]]],
        ];
    }

    private function productPayload(): array
    {
        return ['kode_barang' => 'OWN-1', 'nama_barang' => 'Air mineral', 'kategori' => 'Minuman', 'harga_modal' => 3000, 'harga_jual' => 5000, 'stok' => 10, 'stok_minimal' => 2, 'satuan' => 'Botol', 'status' => 'active'];
    }

    private function user(string $role = 'cashier'): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'active']);
    }
}
