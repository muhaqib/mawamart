<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockIn extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = [
        'invoice_number',
        'product_id',
        'qty',
        'harga_beli',
        'harga_jual',
        'discount_percent',
        'discount_amount',
        'subtotal',
        'supplier',
        'tanggal',
        'expired_at',
        'barcode',
        'keterangan',
        'nota_pembelian',
        'surat_jalan',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'harga_beli' => 'integer',
            'harga_jual' => 'integer',
            'discount_percent' => 'decimal:2',
            'discount_amount' => 'integer',
            'subtotal' => 'integer',
            'tanggal' => 'date',
            'expired_at' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
