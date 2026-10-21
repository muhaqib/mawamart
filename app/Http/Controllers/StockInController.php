<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockInRequest;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\StockIn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StockInController extends Controller
{
    public function store(StockInRequest $request): RedirectResponse
    {
        $data = $request->stockData();

        if ($request->hasFile('nota_pembelian')) {
            $data['nota_pembelian'] = $request->file('nota_pembelian')->store('stock_ins');
        }

        if ($request->hasFile('surat_jalan')) {
            $data['surat_jalan'] = $request->file('surat_jalan')->store('stock_ins');
        }

        DB::transaction(function () use ($data): void {
            $stockIn = StockIn::create(collect($data)->only([
                'invoice_number',
                'tanggal',
                'product_id',
                'qty',
                'harga_beli',
                'harga_jual',
                'discount_percent',
                'discount_amount',
                'subtotal',
                'expired_at',
                'barcode',
                'supplier',
                'keterangan',
                'nota_pembelian',
                'surat_jalan',
            ])->all());

            $productUpdates = collect($data)->only([
                'harga_modal',
                'harga_jual',
                'kode_barang',
            ])->filter(fn ($value) => $value !== null && $value !== '')->all();

            $product = Product::lockForUpdate()->findOrFail($data['product_id']);

            if ($productUpdates !== []) {
                $product->update($productUpdates);
            }

            $product->increment('stok', $data['qty']);

            AuditLog::record('stock_in.created', $stockIn, [
                'product_id' => $data['product_id'],
                'qty' => $data['qty'],
                'product_updates' => array_keys($productUpdates),
            ]);
        });

        return redirect()->route('dashboard', ['page' => 'purchases'])->with('success', 'Barang masuk tersimpan dan stok bertambah.');
    }

    public function update(StockInRequest $request, StockIn $stockIn): RedirectResponse
    {
        $this->authorize('update', $stockIn);

        $data = $request->stockData();

        if ($request->hasFile('nota_pembelian')) {
            if ($stockIn->nota_pembelian) {
                Storage::disk('local')->delete($stockIn->nota_pembelian);
            }

            $data['nota_pembelian'] = $request->file('nota_pembelian')->store('stock_ins');
        }

        if ($request->hasFile('surat_jalan')) {
            if ($stockIn->surat_jalan) {
                Storage::disk('local')->delete($stockIn->surat_jalan);
            }

            $data['surat_jalan'] = $request->file('surat_jalan')->store('stock_ins');
        }

        DB::transaction(function () use ($data, $stockIn): void {
            $oldProduct = Product::lockForUpdate()->findOrFail($stockIn->product_id);
            $newProduct = Product::lockForUpdate()->findOrFail($data['product_id']);
            $oldProduct->update(['stok' => max(0, $oldProduct->stok - $stockIn->qty)]);

            $stockIn->update(collect($data)->only([
                'invoice_number',
                'tanggal',
                'product_id',
                'qty',
                'harga_beli',
                'harga_jual',
                'discount_percent',
                'discount_amount',
                'subtotal',
                'expired_at',
                'barcode',
                'supplier',
                'keterangan',
                'nota_pembelian',
                'surat_jalan',
            ])->all());

            $productUpdates = collect($data)->only([
                'harga_modal',
                'harga_jual',
                'kode_barang',
            ])->filter(fn ($value) => $value !== null && $value !== '')->all();

            if ($productUpdates !== []) {
                $newProduct->update($productUpdates);
            }

            $newProduct->increment('stok', $data['qty']);

            AuditLog::record('stock_in.updated', $stockIn, [
                'product_id' => $data['product_id'],
                'qty' => $data['qty'],
            ]);
        });

        return redirect()->route('dashboard', ['page' => 'purchases'])->with('success', 'Pembelian berhasil diperbarui.');
    }

    public function destroy(Request $request, StockIn $stockIn): RedirectResponse
    {
        $this->authorize('delete', $stockIn);

        DB::transaction(function () use ($stockIn): void {
            $product = Product::lockForUpdate()->find($stockIn->product_id);

            if ($product) {
                $product->update(['stok' => max(0, $product->stok - $stockIn->qty)]);
            }

            foreach (['nota_pembelian', 'surat_jalan'] as $document) {
                if ($stockIn->{$document}) {
                    Storage::disk('local')->delete($stockIn->{$document});
                }
            }

            AuditLog::record('stock_in.deleted', $stockIn, [
                'product_id' => $stockIn->product_id,
                'qty' => $stockIn->qty,
            ]);

            $stockIn->delete();
        });

        return redirect()->route('dashboard', ['page' => 'purchases'])->with('success', 'Pembelian berhasil dihapus.');
    }

    public function document(StockIn $stockIn, string $document): BinaryFileResponse
    {
        abort_unless(in_array($document, ['nota_pembelian', 'surat_jalan'], true), 404);

        $path = $stockIn->{$document};
        abort_unless($path, 404);

        $disk = Storage::disk('local');
        if ($disk->exists($path)) {
            AuditLog::record('stock_in.document_viewed', $stockIn, [
                'document' => $document,
            ]);

            return response()->file($disk->path($path));
        }

        $publicDisk = Storage::disk('public');
        abort_unless($publicDisk->exists($path), 404);

        AuditLog::record('stock_in.document_viewed', $stockIn, [
            'document' => $document,
            'legacy_public_storage' => true,
        ]);

        return response()->file($publicDisk->path($path));
    }
}
