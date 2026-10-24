<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
        foreach (['Food', 'Non Food'] as $name) {
            DB::table('departments')->insert(['name' => $name, 'created_at' => now(), 'updated_at' => now()]);
        }
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->constrained()->restrictOnDelete();
        });
        Schema::create('subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name', 100);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->unique(['category_id', 'name']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('subcategory_id')->nullable()->constrained()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', fn (Blueprint $table) => $table->dropConstrainedForeignId('subcategory_id'));
        Schema::dropIfExists('subcategories');
        Schema::table('categories', fn (Blueprint $table) => $table->dropConstrainedForeignId('department_id'));
        Schema::dropIfExists('departments');
    }
};
