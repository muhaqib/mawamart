<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_ins', function (Blueprint $table): void {
            if (! Schema::hasColumn('stock_ins', 'invoice_number')) {
                $table->string('invoice_number')->nullable()->after('id');
            }

            if (! Schema::hasColumn('stock_ins', 'discount_percent')) {
                $table->decimal('discount_percent', 8, 2)->default(0)->after('harga_jual');
            }

            if (! Schema::hasColumn('stock_ins', 'discount_amount')) {
                $table->unsignedInteger('discount_amount')->default(0)->after('discount_percent');
            }

            if (! Schema::hasColumn('stock_ins', 'subtotal')) {
                $table->unsignedInteger('subtotal')->default(0)->after('discount_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_ins', function (Blueprint $table): void {
            foreach (['invoice_number', 'discount_percent', 'discount_amount', 'subtotal'] as $column) {
                if (Schema::hasColumn('stock_ins', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
