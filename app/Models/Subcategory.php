<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = ['name', 'category_id'];
}
