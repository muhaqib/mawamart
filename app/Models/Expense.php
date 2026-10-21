<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'user_id',
        'spent_at',
        'category',
        'uraian',
        'description',
        'volume',
        'unit',
        'price',
        'amount',
        'notes',
        'attachment',
    ];

    protected function casts(): array
    {
        return [
            'spent_at' => 'date',
            'volume' => 'decimal:2',
            'price' => 'integer',
            'amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
