<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use Illuminate\Support\Facades\DB;

class StockOpnameService
{
    public function update(StockOpname $stockOpname, array $data): void
    {
        DB::transaction(function () use ($stockOpname, $data): void {
            $lockedOpname = StockOpname::lockForUpdate()->findOrFail($stockOpname->id);
            $adjustment = StockAdjustment::query()
                ->where('stock_opname_id', $lockedOpname->id)
                ->when(isset($data['adjustment_id']), fn ($query) => $query->whereKey($data['adjustment_id']))
                ->lockForUpdate()
                ->firstOrFail();

            $oldProduct = Product::lockForUpdate()->findOrFail($adjustment->product_id);
            $newProductId = (int) $data['product_id'];
            $actualStock = (int) $data['actual_stock'];

            if ($oldProduct->id === $newProductId) {
                $oldProduct->update([
                    'stok' => max(0, $oldProduct->stok + ($actualStock - $adjustment->actual_stock)),
                ]);
                $systemStock = $adjustment->system_stock;
                $newProduct = $oldProduct;
            } else {
                $oldProduct->update([
                    'stok' => max(0, $oldProduct->stok - $adjustment->difference),
                ]);
                $newProduct = Product::lockForUpdate()->findOrFail($newProductId);
                $systemStock = $newProduct->stok;
                $newProduct->update(['stok' => $actualStock]);
            }

            $lockedOpname->update([
                'opname_date' => $data['opname_date'],
                'notes' => $data['reason'],
            ]);
            $adjustment->update([
                'product_id' => $newProduct->id,
                'system_stock' => $systemStock,
                'actual_stock' => $actualStock,
                'difference' => $actualStock - $systemStock,
                'reason' => $data['reason'],
            ]);
        });
    }

    public function delete(StockOpname $stockOpname): void
    {
        DB::transaction(function () use ($stockOpname): void {
            $lockedOpname = StockOpname::lockForUpdate()->findOrFail($stockOpname->id);
            $adjustments = StockAdjustment::query()
                ->where('stock_opname_id', $lockedOpname->id)
                ->lockForUpdate()
                ->get();

            foreach ($adjustments as $adjustment) {
                $product = Product::lockForUpdate()->find($adjustment->product_id);
                if ($product) {
                    $product->update([
                        'stok' => max(0, $product->stok - $adjustment->difference),
                    ]);
                }
            }

            $lockedOpname->adjustments()->delete();
            $lockedOpname->delete();
        });
    }
}
