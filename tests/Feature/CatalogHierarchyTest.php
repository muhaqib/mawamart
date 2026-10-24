<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Department;
use App\Models\Product;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogHierarchyTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_crud_and_parent_deletion_guards(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $this->actingAs($admin);
        $this->assertDatabaseHas('departments', ['name' => 'Food']);
        $this->assertDatabaseHas('departments', ['name' => 'Non Food']);
        $this->post(route('departments.store'), ['name' => 'Fresh'])->assertSessionHasNoErrors();
        $department = Department::where('name', 'Fresh')->sole();
        $this->put(route('departments.update', $department), ['name' => 'Fresh Food'])->assertSessionHasNoErrors();
        $this->post(route('categories.store'), ['nama_kategori' => 'Buah', 'department_id' => $department->id])->assertSessionHasNoErrors();
        $category = Category::where('nama_kategori', 'Buah')->sole();
        $this->post(route('subcategories.store'), ['name' => 'Lokal', 'category_id' => $category->id])->assertSessionHasNoErrors();
        $subcategory = Subcategory::sole();
        $payload = ['kode_barang' => 'APEL-1', 'nama_barang' => 'Apel', 'kategori' => 'Buah', 'subcategory_id' => $subcategory->id, 'harga_modal' => 2000, 'harga_jual' => 4000, 'stok' => 10, 'stok_minimal' => 2, 'satuan' => 'Buah', 'status' => 'active'];
        $this->post(route('products.store'), $payload)->assertSessionHasNoErrors();
        $product = Product::sole();
        $this->assertSame($subcategory->id, $product->subcategory_id);
        foreach (['departments', 'subcategories', 'inventory', 'categories', 'product-edit'] as $page) {
            $this->get('/?page='.$page)->assertOk()->assertSee('dalwa-react-root');
        }
        $this->delete(route('departments.destroy', $department))->assertSessionHasErrors('name');
        $this->delete(route('categories.destroy', $category))->assertSessionHasErrors('kategori');
        $this->delete(route('subcategories.destroy', $subcategory))->assertSessionHasErrors('name');
        $otherCategory = Category::create(['nama_kategori' => 'Sayur', 'department_id' => $department->id]);
        $this->put(route('subcategories.update', $subcategory), ['name' => 'Lokal', 'category_id' => $otherCategory->id])->assertSessionHasErrors('category_id');
        $this->delete(route('categories.destroy', $otherCategory))->assertSessionHasNoErrors();
        $this->put(route('categories.update', $category), ['nama_kategori' => 'Buah Segar', 'department_id' => $department->id])->assertSessionHasNoErrors();
        $this->assertSame('Buah Segar', $product->fresh()->kategori);
        $this->put(route('subcategories.update', $subcategory), ['name' => 'Buah Lokal', 'category_id' => $category->id])->assertSessionHasNoErrors();
        $this->put(route('products.update', $product), array_replace($payload, ['nama_barang' => 'Apel Merah', 'kategori' => 'Buah Segar', 'harga_jual' => 5000]))->assertSessionHasNoErrors();
        $this->assertSame(5000, $product->fresh()->harga_jual);
        $this->delete(route('products.destroy', $product))->assertSessionHasNoErrors();
        $this->delete(route('subcategories.destroy', $subcategory))->assertSessionHasNoErrors();
        $this->delete(route('categories.destroy', $category))->assertSessionHasNoErrors();
        $this->delete(route('departments.destroy', $department))->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }

    public function test_invalid_hierarchy_and_foreign_owner_updates_are_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'cashier', 'status' => 'active']);
        $this->actingAs($owner);
        $department = Department::create(['name' => 'Khusus']);
        $category = Category::create(['nama_kategori' => 'Sabun', 'department_id' => $department->id]);
        Category::create(['nama_kategori' => 'Minuman']);
        $subcategory = Subcategory::create(['name' => 'Cair', 'category_id' => $category->id]);
        $this->postJson(route('products.store'), ['kode_barang' => 'BAD', 'nama_barang' => 'Salah', 'kategori' => 'Minuman', 'subcategory_id' => $subcategory->id, 'harga_modal' => 0, 'harga_jual' => 0, 'stok' => 0, 'stok_minimal' => 0, 'satuan' => 'Unit', 'status' => 'active'])
            ->assertUnprocessable()->assertJsonValidationErrors('subcategory_id');
        $this->postJson(route('subcategories.store'), ['name' => 'Cair', 'category_id' => $category->id])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson(route('categories.store'), ['nama_kategori' => 'Invalid', 'department_id' => 999])->assertUnprocessable()->assertJsonValidationErrors('department_id');
        $other = User::factory()->create(['role' => 'cashier', 'status' => 'active']);
        $this->actingAs($other);
        $this->put(route('departments.update', $department), ['name' => 'Diubah'])->assertForbidden();
        $this->delete(route('subcategories.destroy', $subcategory))->assertForbidden();
        $this->assertDatabaseHas('departments', ['id' => $department->id, 'name' => 'Khusus']);
    }
}
