<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockOpnameRequest;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Services\StockOpnameService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockOpnameController extends Controller
{
    public function updateDate(Request $request, StockOpname $stockOpname): RedirectResponse
    {
        $this->authorize('update', $stockOpname);
        $data = $request->validate(['opname_date' => ['required', 'date']]);

        $stockOpname->update($data);
        AuditLog::record('stock_opname.date_updated', $stockOpname, $data);

        return back()->with('success', 'Tanggal stok opname berhasil diperbarui.');
    }

    public function store(StockOpnameRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request): void {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $systemStock = $product->stok;
            $actualStock = (int) $data['actual_stock'];

            $opname = StockOpname::create([
                'user_id' => $request->user()->id,
                'opname_date' => $data['opname_date'] ?? now()->toDateString(),
                'status' => 'completed',
                'notes' => $data['reason'],
                'completed_at' => now(),
            ]);

            $adjustment = StockAdjustment::create([
                'stock_opname_id' => $opname->id,
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'system_stock' => $systemStock,
                'actual_stock' => $actualStock,
                'difference' => $actualStock - $systemStock,
                'reason' => $data['reason'],
            ]);

            $product->update(['stok' => $actualStock]);

            AuditLog::record('stock_opname.completed', $opname, [
                'product_id' => $product->id,
                'adjustment_id' => $adjustment->id,
                'system_stock' => $systemStock,
                'actual_stock' => $actualStock,
            ]);
        });

        return redirect()->route('dashboard', ['page' => 'stock-opname'])->with('success', 'Stok opname tersimpan dan stok disesuaikan.');
    }

    public function update(
        StockOpnameRequest $request,
        StockOpname $stockOpname,
        StockOpnameService $stockOpnames,
    ): RedirectResponse {
        $this->authorize('update', $stockOpname);
        $data = $request->validated();

        $stockOpnames->update($stockOpname, $data);
        AuditLog::record('stock_opname.updated', $stockOpname, $data);

        return redirect()->route('dashboard', ['page' => 'stock-opname'])
            ->with('success', 'Stok opname berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        StockOpname $stockOpname,
        StockOpnameService $stockOpnames,
    ): RedirectResponse {
        $this->authorize('delete', $stockOpname);

        AuditLog::record('stock_opname.deleted', $stockOpname, [
            'opname_date' => $stockOpname->opname_date->toDateString(),
        ]);
        $stockOpnames->delete($stockOpname);

        return redirect()->route('dashboard', ['page' => 'stock-opname'])
            ->with('success', 'Stok opname berhasil dihapus.');
    }
}
