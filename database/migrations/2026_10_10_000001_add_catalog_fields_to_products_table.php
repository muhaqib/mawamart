<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'stok_minimal')) {
                $table->unsignedInteger('stok_minimal')->default(20)->after('stok');
            }

            if (! Schema::hasColumn('products', 'foto_produk')) {
                $table->string('foto_produk')->nullable()->after('status');
            }

            if (! Schema::hasColumn('products', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('foto_produk');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasColumn('products', 'deskripsi')) {
                $table->dropColumn('deskripsi');
            }

            if (Schema::hasColumn('products', 'foto_produk')) {
                $table->dropColumn('foto_produk');
            }

            if (Schema::hasColumn('products', 'stok_minimal')) {
                $table->dropColumn('stok_minimal');
            }
        });
    }
};
