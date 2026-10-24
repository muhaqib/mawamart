<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'kategori',
        'subcategory_id',
        'supplier_id',
        'harga_beli',
        'harga_modal',
        'harga_jual',
        'stok',
        'stok_minimal',
        'satuan',
        'status',
        'foto_produk',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'supplier_id' => 'integer',
            'harga_beli' => 'integer',
            'harga_modal' => 'integer',
            'harga_jual' => 'integer',
            'stok' => 'integer',
            'stok_minimal' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockIns(): HasMany
    {
        return $this->hasMany(StockIn::class);
    }

    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
