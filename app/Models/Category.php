<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = ['nama_kategori'];
}
