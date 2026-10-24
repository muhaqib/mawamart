<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubcategoryController extends Controller
{
    private function validated(Request $request, ?Subcategory $record = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:100', Rule::unique('subcategories', 'name')->where('category_id', $request->input('category_id'))->ignore($record)],
        ]);
    }

    public function store(Request $request)
    {
        $record = Subcategory::create($this->validated($request));
        AuditLog::record('subcategory.created', $record);

        return redirect()->route('dashboard', ['page' => 'subcategories'])->with('success', 'Subkategori berhasil ditambahkan.');
    }

    public function update(Request $request, Subcategory $subcategory)
    {
        $this->authorize('update', $subcategory);
        if ($subcategory->category_id != $request->input('category_id') && Product::where('subcategory_id', $subcategory->id)->exists()) {
            return back()->withErrors(['category_id' => 'Subkategori masih dipakai barang. Lepaskan hubungan barang sebelum memindahkan kategori.']);
        }
        $subcategory->update($this->validated($request, $subcategory));
        AuditLog::record('subcategory.updated', $subcategory);

        return redirect()->route('dashboard', ['page' => 'subcategories'])->with('success', 'Subkategori berhasil diperbarui.');
    }

    public function destroy(Subcategory $subcategory)
    {
        $this->authorize('delete', $subcategory);
        if (Product::where('subcategory_id', $subcategory->id)->exists()) {
            return back()->withErrors(['name' => 'Subkategori masih digunakan dan belum bisa dihapus.']);
        }
        $subcategory->delete();
        AuditLog::record('subcategory.deleted', $subcategory);

        return redirect()->route('dashboard', ['page' => 'subcategories'])->with('success', 'Subkategori berhasil dihapus.');
    }
}
