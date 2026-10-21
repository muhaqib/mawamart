<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori')->unique();
            $table->timestamps();
        });

        // Migrate existing categories from products table
        $existingCategories = DB::table('products')->select('kategori')->distinct()->pluck('kategori');
        $now = now();
        $insertData = $existingCategories->map(fn ($cat) => [
            'nama_kategori' => $cat,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        if (! empty($insertData)) {
            DB::table('categories')->insert($insertData);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
