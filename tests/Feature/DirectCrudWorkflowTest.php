<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class DirectCrudWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_edit_of_own_product_is_applied_immediately(): void
    {
        $cashier = $this->user('cashier', 'cashier');
        $this->actingAs($cashier);
        $product = Product::create($this->productPayload());

        $this->put(route('products.update', $product), [
            ...$this->productPayload(),
            'nama_barang' => 'Produk Baru',
            'harga_jual' => 6000,
        ])->assertRedirect(route('dashboard', ['page' => 'inventory']));

        $this->assertSame('Produk Baru', $product->fresh()->nama_barang);
        $this->assertSame(6000, $product->fresh()->harga_jual);
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_cashier_delete_of_own_expense_is_applied_immediately(): void
    {
        $cashier = $this->user('cashier', 'cashier');
        $expense = Expense::create([
            'user_id' => $cashier->id,
            'spent_at' => '2026-10-15',
            'category' => 'Operasional',
            'uraian' => 'Biaya kirim',
            'description' => 'Biaya kirim',
            'volume' => 1,
            'unit' => 'Kali',
            'price' => 20000,
            'amount' => 20000,
        ]);

        $this->actingAs($cashier)
            ->delete(route('expenses.destroy', $expense))
            ->assertRedirect(route('dashboard', ['page' => 'operations']));

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
        $this->assertDatabaseCount('approval_requests', 0);
    }

    public function test_approval_routes_have_been_removed(): void
    {
        $this->assertFalse(Route::has('approval-requests.approve'));
        $this->assertFalse(Route::has('approval-requests.reject'));
    }

    private function user(string $role, string $username): User
    {
        return User::factory()->create([
            'username' => $username,
            'role' => $role,
            'status' => 'active',
        ]);
    }

    private function productPayload(): array
    {
        return [
            'kode_barang' => 'DW-001',
            'nama_barang' => 'Produk Lama',
            'kategori' => 'Air Mineral',
            'harga_modal' => 3000,
            'harga_jual' => 5000,
            'stok' => 10,
            'stok_minimal' => 5,
            'satuan' => 'Botol',
            'status' => 'active',
        ];
    }
}
