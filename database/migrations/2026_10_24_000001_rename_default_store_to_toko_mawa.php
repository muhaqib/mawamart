<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('app_settings')
            ->where('key', 'receipt_store_name')
            ->whereRaw('LOWER(value) = ?', ['mawa mart'])
            ->update(['value' => 'TOKO MAWA']);
    }

    public function down(): void
    {
        DB::table('app_settings')
            ->where('key', 'receipt_store_name')
            ->where('value', 'TOKO MAWA')
            ->update(['value' => 'MAWA MART']);
    }
};
