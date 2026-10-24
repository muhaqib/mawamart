<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        if ($request->hasFile('foto_produk')) {
            $data['foto_produk'] = $request->file('foto_produk')->store('products', 'public');
        }

        $product = Product::create($data);

        AuditLog::record('product.created', $product);

        return redirect()->route('dashboard', ['page' => 'inventory'])->with('success', 'Barang berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $data = $this->validated($request, $product);

        if ($request->hasFile('foto_produk')) {
            if ($product->foto_produk) {
                Storage::disk('public')->delete($product->foto_produk);
            }

            $data['foto_produk'] = $request->file('foto_produk')->store('products', 'public');
        }

        $product->update($data);

        AuditLog::record('product.updated', $product);

        return redirect()->route('dashboard', ['page' => 'inventory'])->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        if ($product->transactionDetails()->exists()) {
            $product->update(['status' => 'inactive']);

            AuditLog::record('product.inactivated', $product);

            return redirect()->route('dashboard', ['page' => 'inventory'])
                ->with('success', 'Barang memiliki riwayat transaksi, status diubah menjadi nonaktif.');
        }

        $product->delete();

        if ($product->foto_produk) {
            Storage::disk('public')->delete($product->foto_produk);
        }

        AuditLog::record('product.deleted', $product, [
            'kode_barang' => $product->kode_barang,
            'nama_barang' => $product->nama_barang,
        ]);

        return redirect()->route('dashboard', ['page' => 'inventory'])->with('success', 'Barang berhasil dihapus.');
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'kode_barang' => [
                'required',
                'string',
                'max:50',
                Rule::unique('products', 'kode_barang')->ignore($product),
            ],
            'nama_barang' => ['required', 'string', 'max:150'],
            'kategori' => ['required', 'string', 'max:100', 'exists:categories,nama_kategori'],
            'subcategory_id' => ['nullable', 'integer', Rule::exists('subcategories', 'id')->whereIn('category_id', Category::where('nama_kategori', $request->input('kategori'))->select('id'))],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'harga_beli' => ['sometimes', 'required', 'integer', 'min:0'],
            'harga_modal' => ['required', 'integer', 'min:0'],
            'harga_jual' => ['required', 'integer', 'min:0'],
            'stok' => ['required', 'integer', 'min:0'],
            'stok_minimal' => ['required', 'integer', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'foto_produk' => ['nullable', 'image', 'max:2048'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]) + ['subcategory_id' => null];
    }
}
