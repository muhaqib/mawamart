<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentVerification extends Model
{
    protected $fillable = [
        'transaction_id',
        'user_id',
        'verified_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }
}
