<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeploymentHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Category::firstOrCreate(['nama_kategori' => 'Minuman']);
    }

    public function test_duplicate_transaction_products_are_rejected_before_stock_changes(): void
    {
        $cashier = $this->user('cashier');
        $product = $this->product(stok: 3);

        $this->actingAs($cashier)->post(route('transactions.store'), [
            'items' => [
                ['product_id' => $product->id, 'qty' => 2],
                ['product_id' => $product->id, 'qty' => 2],
            ],
            'payment_type' => 'cash',
            'payment_status' => 'paid',
            'uang_diterima' => 100000,
        ])->assertSessionHasErrors('items.1.product_id');

        $this->assertSame(3, $product->fresh()->stok);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_expense_and_purchase_totals_are_recalculated_on_server(): void
    {
        $admin = $this->user('admin');
        $product = $this->product();

        $this->actingAs($admin)->post(route('expenses.store'), [
            'spent_at' => '2026-10-16',
            'uraian' => 'Bahan bakar',
            'volume' => 2,
            'unit' => 'Liter',
            'price' => 15000,
            'amount' => 1,
        ])->assertSessionHasNoErrors();

        $this->assertSame(30000, Expense::sole()->amount);

        $this->actingAs($admin)->post(route('stock-ins.store'), [
            'tanggal' => '2026-10-16',
            'product_id' => $product->id,
            'qty' => 4,
            'harga_beli' => 5000,
            'harga_jual' => 8000,
            'discount_amount' => 2000,
            'subtotal' => 1,
        ])->assertSessionHasNoErrors();

        $this->assertSame(18000, StockIn::sole()->subtotal);
    }

    public function test_repeated_cashier_edits_are_applied_directly(): void
    {
        $cashier = $this->user('cashier');
        $this->actingAs($cashier);
        $product = $this->product();
        $payload = $this->productPayload($product, 'Nama dari Kasir');

        $this->actingAs($cashier)
            ->put(route('products.update', $product), $payload)
            ->assertSessionHasNoErrors();

        $payload['nama_barang'] = 'Nama Terakhir dari Kasir';
        $this->actingAs($cashier)
            ->put(route('products.update', $product), $payload)
            ->assertSessionHasNoErrors();

        $this->assertSame('Nama Terakhir dari Kasir', $product->fresh()->nama_barang);
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_last_active_admin_cannot_be_demoted_or_deactivated(): void
    {
        $admin = $this->user('admin');

        $this->actingAs($admin)->put(route('cashiers.update', $admin), [
            'name' => $admin->name,
            'username' => $admin->username,
            'role' => 'cashier',
            'status' => 'active',
        ])->assertSessionHasErrors('role');

        $this->assertSame('admin', $admin->fresh()->role);
        $this->assertSame('active', $admin->fresh()->status);
    }

    public function test_security_headers_are_present(): void
    {
        $this->get(route('login.form'))
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_large_product_list_is_paginated_and_only_current_page_is_sent(): void
    {
        $admin = $this->user('admin');
        foreach (range(1, 30) as $index) {
            Product::create([
                'kode_barang' => 'PAGE-'.$index,
                'nama_barang' => 'Produk '.$index,
                'kategori' => 'Minuman',
                'harga_modal' => 1000,
                'harga_jual' => 2000,
                'stok' => 5,
                'satuan' => 'Botol',
                'status' => 'active',
            ]);
        }

        $response = $this->actingAs($admin)->get(route('dashboard', [
            'page' => 'inventory',
            'data_page' => 2,
        ]))->assertOk();

        $this->assertCount(5, $response->viewData('products'));
        $this->assertSame(30, $response->viewData('pagination')['products']['total']);
        $this->assertSame(2, $response->viewData('pagination')['products']['current_page']);
    }

    public function test_admin_and_cashier_main_pages_render(): void
    {
        foreach (['admin', 'cashier'] as $role) {
            $this->actingAs($this->user($role))
                ->get(route('dashboard', ['page' => 'dashboard']))
                ->assertOk()
                ->assertSee('dalwa-react-root');
        }
    }

    private function user(string $role): User
    {
        return User::factory()->create([
            'username' => fake()->unique()->userName(),
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function product(int $stok = 10): Product
    {
        return Product::create([
            'kode_barang' => 'DW-'.fake()->unique()->numerify('#####'),
            'nama_barang' => 'Air Mineral',
            'kategori' => 'Minuman',
            'harga_modal' => 5000,
            'harga_jual' => 8000,
            'stok' => $stok,
            'stok_minimal' => 2,
            'satuan' => 'Botol',
            'status' => 'active',
        ]);
    }

    private function productPayload(Product $product, string $name): array
    {
        return [
            'kode_barang' => $product->kode_barang,
            'nama_barang' => $name,
            'kategori' => $product->kategori,
            'harga_modal' => $product->harga_modal,
            'harga_jual' => $product->harga_jual,
            'stok' => $product->stok,
            'stok_minimal' => $product->stok_minimal,
            'satuan' => $product->satuan,
            'status' => $product->status,
        ];
    }
}
