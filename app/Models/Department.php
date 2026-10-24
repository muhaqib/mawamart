<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use Concerns\RecordsCreator;

    protected $fillable = ['name'];
}
