<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierShift extends Model
{
    protected $fillable = [
        'user_id',
        'opened_at',
        'opening_cash',
        'closed_at',
        'closing_cash',
        'expected_cash',
        'cash_sales',
        'transfer_sales',
        'pending_sales',
        'void_total',
        'difference',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'opening_cash' => 'integer',
            'closing_cash' => 'integer',
            'expected_cash' => 'integer',
            'cash_sales' => 'integer',
            'transfer_sales' => 'integer',
            'pending_sales' => 'integer',
            'void_total' => 'integer',
            'difference' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereNull('closed_at');
    }

    public function isOpen(): bool
    {
        return $this->closed_at === null;
    }
}
