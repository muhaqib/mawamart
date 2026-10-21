<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori',
        ]);

        $category = Category::create([
            'nama_kategori' => $request->nama_kategori,
        ]);

        AuditLog::record('category.created', $category);

        return redirect()->route('dashboard', ['page' => 'categories'])->with('success', 'Kategori produk berhasil disimpan.');
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:categories,nama_kategori,'.$category->id,
        ]);

        $oldName = $category->nama_kategori;

        $category->update([
            'nama_kategori' => $request->nama_kategori,
        ]);

        Product::where('kategori', $oldName)->update([
            'kategori' => $category->nama_kategori,
        ]);

        AuditLog::record('category.updated', $category);

        return redirect()->route('dashboard', ['page' => 'categories'])->with('success', 'Kategori produk berhasil diperbarui.');
    }

    public function destroy(Request $request, Category $category)
    {
        $this->authorize('delete', $category);

        if (Product::where('kategori', $category->nama_kategori)->exists()) {
            return redirect()->back()->withErrors([
                'kategori' => 'Kategori masih dipakai produk dan belum bisa dihapus.',
            ]);
        }

        $category->delete();

        AuditLog::record('category.deleted', $category, [
            'nama_kategori' => $category->nama_kategori,
        ]);

        return redirect()->back()->with('success', 'Kategori produk berhasil dihapus.');
    }
}
