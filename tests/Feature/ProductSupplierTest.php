<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSupplierTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return ['kode_barang' => 'NEW-001', 'nama_barang' => 'Barang Baru', 'kategori' => 'Minuman', 'harga_modal' => 2500, 'harga_beli' => 3000, 'harga_jual' => 5000, 'stok' => 10, 'stok_minimal' => 2, 'satuan' => 'Botol', 'status' => 'active'];
    }

    public function test_product_supplier_and_separate_purchase_price_can_be_saved_edited_and_cleared(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin', 'status' => 'active']));
        Category::create(['nama_kategori' => 'Minuman']);
        $supplier = Supplier::create(['nama' => 'Suplier Utama']);
        $second = Supplier::create(['nama' => 'Suplier Kedua']);
        $this->post(route('products.store'), $this->payload() + ['supplier_id' => $supplier->id])->assertSessionHasNoErrors();
        $product = Product::sole();
        $this->assertSame($supplier->id, $product->supplier->id);
        $this->assertSame(3000, $product->harga_beli);
        $this->assertSame(2500, $product->harga_modal);
        $this->delete(route('suppliers.destroy', $supplier))->assertSessionHasErrors('supplier_id');
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
        $this->put(route('products.update', $product), array_replace($this->payload(), ['supplier_id' => $second->id, 'harga_beli' => 3500]))->assertSessionHasNoErrors();
        $this->assertSame($second->id, $product->fresh()->supplier_id);
        $this->assertSame(3500, $product->fresh()->harga_beli);
        $this->put(route('products.update', $product), $this->payload() + ['supplier_id' => ''])->assertSessionHasNoErrors();
        $this->assertNull($product->fresh()->supplier_id);
        $this->delete(route('suppliers.destroy', $supplier))->assertSessionHasNoErrors();
        $response = $this->get('/?page=product-create')->assertOk();
        $this->assertTrue($response->viewData('suppliers')->contains('id', $second->id));
        foreach (['department-create', 'department-edit', 'subcategory-create', 'subcategory-edit'] as $page) {
            $this->get('/?page='.$page)->assertOk();
        }
    }

    public function test_invalid_supplier_and_negative_purchase_price_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin', 'status' => 'active']));
        Category::create(['nama_kategori' => 'Minuman']);
        $this->postJson(route('products.store'), array_replace($this->payload(), ['supplier_id' => 99999, 'harga_beli' => -1]))
            ->assertUnprocessable()->assertJsonValidationErrors(['supplier_id', 'harga_beli']);
        $this->assertDatabaseCount('products', 0);
    }
}
