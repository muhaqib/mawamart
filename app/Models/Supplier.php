<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = [
        'nama',
        'nomor_telepon',
        'email',
        'alamat',
    ];
}
