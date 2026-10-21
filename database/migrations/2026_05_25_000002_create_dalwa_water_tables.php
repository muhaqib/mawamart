<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('kode_barang')->unique();
            $table->string('nama_barang');
            $table->string('kategori');
            $table->unsignedInteger('harga_modal')->default(0);
            $table->unsignedInteger('harga_jual')->default(0);
            $table->unsignedInteger('stok')->default(0);
            $table->string('satuan')->default('Unit');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('stock_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('qty');
            $table->string('supplier')->nullable();
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi')->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('total');
            $table->string('payment_type');
            $table->unsignedInteger('uang_diterima')->default(0);
            $table->unsignedInteger('kembalian')->default(0);
            $table->string('bank_name')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('payment_status')->default('paid');
            $table->timestamps();
        });

        Schema::create('transaction_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('qty');
            $table->unsignedInteger('harga');
            $table->unsignedInteger('subtotal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_details');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('stock_ins');
        Schema::dropIfExists('products');
    }
};
