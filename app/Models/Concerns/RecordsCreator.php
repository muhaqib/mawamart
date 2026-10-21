<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

trait RecordsCreator
{
    public static function bootRecordsCreator(): void
    {
        static::creating(function (Model $record): void {
            // Ownership is set by the server and cannot be supplied through form data.
            if (auth()->check()) {
                $record->user_id = auth()->id();
            }
        });
    }
}
