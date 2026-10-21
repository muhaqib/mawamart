<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (! Schema::hasColumn('expenses', 'uraian')) {
                $table->string('uraian')->nullable();
            }

            if (! Schema::hasColumn('expenses', 'volume')) {
                $table->decimal('volume', 12, 2)->default(1);
            }

            if (! Schema::hasColumn('expenses', 'unit')) {
                $table->string('unit', 50)->nullable();
            }

            if (! Schema::hasColumn('expenses', 'price')) {
                $table->unsignedInteger('price')->default(0);
            }

            if (! Schema::hasColumn('expenses', 'notes')) {
                $table->text('notes')->nullable();
            }
        });

        DB::table('expenses')
            ->whereNull('uraian')
            ->update([
                'uraian' => DB::raw('description'),
                'unit' => 'Unit',
                'price' => DB::raw('amount'),
            ]);
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            foreach (['notes', 'price', 'unit', 'volume', 'uraian'] as $column) {
                if (Schema::hasColumn('expenses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
