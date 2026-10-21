<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $supplier = Supplier::create($this->validated($request));

        AuditLog::record('supplier.created', $supplier);

        return redirect()->route('dashboard', ['page' => 'suppliers'])->with('success', 'Suplier berhasil disimpan.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        $data = $this->validated($request, $supplier);

        $supplier->update($data);

        AuditLog::record('supplier.updated', $supplier);

        return redirect()->route('dashboard', ['page' => 'suppliers'])->with('success', 'Suplier berhasil diperbarui.');
    }

    public function destroy(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        AuditLog::record('supplier.deleted', $supplier, [
            'nama' => $supplier->nama,
        ]);

        return redirect()->route('dashboard', ['page' => 'suppliers'])->with('success', 'Suplier berhasil dihapus.');
    }

    private function validated(Request $request, ?Supplier $supplier = null): array
    {
        return $request->validate([
            'nama' => [
                'required',
                'string',
                'max:150',
                Rule::unique('suppliers', 'nama')->ignore($supplier),
            ],
            'nomor_telepon' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'alamat' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
