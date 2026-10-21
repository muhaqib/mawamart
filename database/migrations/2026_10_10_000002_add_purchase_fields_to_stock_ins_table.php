<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_ins', function (Blueprint $table): void {
            if (! Schema::hasColumn('stock_ins', 'harga_beli')) {
                $table->unsignedInteger('harga_beli')->default(0)->after('qty');
            }

            if (! Schema::hasColumn('stock_ins', 'harga_jual')) {
                $table->unsignedInteger('harga_jual')->default(0)->after('harga_beli');
            }

            if (! Schema::hasColumn('stock_ins', 'expired_at')) {
                $table->date('expired_at')->nullable()->after('tanggal');
            }

            if (! Schema::hasColumn('stock_ins', 'barcode')) {
                $table->string('barcode')->nullable()->after('expired_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_ins', function (Blueprint $table): void {
            foreach (['barcode', 'expired_at', 'harga_jual', 'harga_beli'] as $column) {
                if (Schema::hasColumn('stock_ins', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
