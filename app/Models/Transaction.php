<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'kode_transaksi',
        'user_id',
        'cashier_shift_id',
        'created_at',
        'customer_name',
        'total',
        'discount_per_product',
        'discount_total',
        'payment_type',
        'uang_diterima',
        'kembalian',
        'bank_name',
        'reference_number',
        'payment_status',
        'status',
        'paid_at',
        'settled_by',
        'voided_at',
        'voided_by',
        'void_reason',
        'payment_verified_at',
        'payment_verified_by',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'integer',
            'discount_per_product' => 'integer',
            'discount_total' => 'integer',
            'uang_diterima' => 'integer',
            'kembalian' => 'integer',
            'paid_at' => 'datetime',
            'voided_at' => 'datetime',
            'payment_verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function cashierShift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class);
    }

    public function settledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'settled_by');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function paymentVerifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payment_verified_by');
    }

    public function isVoid(): bool
    {
        return $this->status === 'void';
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query;
    }
}
