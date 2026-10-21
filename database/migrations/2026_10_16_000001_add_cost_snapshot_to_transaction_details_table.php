<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_details', function (Blueprint $table): void {
            $table->unsignedBigInteger('harga_modal')->default(0)->after('harga');
        });

        DB::table('transaction_details')
            ->select(['id', 'product_id'])
            ->orderBy('id')
            ->chunkById(250, function ($details): void {
                $costs = DB::table('products')
                    ->whereIn('id', $details->pluck('product_id'))
                    ->pluck('harga_modal', 'id');

                foreach ($details as $detail) {
                    DB::table('transaction_details')
                        ->where('id', $detail->id)
                        ->update(['harga_modal' => (int) ($costs[$detail->product_id] ?? 0)]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('transaction_details', function (Blueprint $table): void {
            $table->dropColumn('harga_modal');
        });
    }
};
