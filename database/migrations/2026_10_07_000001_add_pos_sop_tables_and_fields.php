<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamp('opened_at');
            $table->unsignedInteger('opening_cash')->default(0);
            $table->timestamp('closed_at')->nullable();
            $table->unsignedInteger('closing_cash')->nullable();
            $table->unsignedInteger('expected_cash')->default(0);
            $table->unsignedInteger('cash_sales')->default(0);
            $table->unsignedInteger('transfer_sales')->default(0);
            $table->unsignedInteger('pending_sales')->default(0);
            $table->unsignedInteger('void_total')->default(0);
            $table->integer('difference')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->nullableMorphs('subject');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'cashier_shift_id')) {
                $table->foreignId('cashier_shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
            }

            if (! Schema::hasColumn('transactions', 'status')) {
                $table->string('status')->default('completed');
            }

            if (! Schema::hasColumn('transactions', 'discount_per_product')) {
                $table->unsignedInteger('discount_per_product')->default(0);
            }

            if (! Schema::hasColumn('transactions', 'discount_total')) {
                $table->unsignedInteger('discount_total')->default(0);
            }

            if (! Schema::hasColumn('transactions', 'voided_at')) {
                $table->timestamp('voided_at')->nullable();
            }

            if (! Schema::hasColumn('transactions', 'voided_by')) {
                $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('transactions', 'void_reason')) {
                $table->text('void_reason')->nullable();
            }

            if (! Schema::hasColumn('transactions', 'payment_verified_at')) {
                $table->timestamp('payment_verified_at')->nullable();
            }

            if (! Schema::hasColumn('transactions', 'payment_verified_by')) {
                $table->foreignId('payment_verified_by')->nullable()->constrained('users')->nullOnDelete();
            }
        });

        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->date('opname_date');
            $table->string('status')->default('completed');
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->integer('system_stock');
            $table->integer('actual_stock');
            $table->integer('difference');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamp('verified_at');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('amount')->default(0);
            $table->text('reason');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payment_verifications');
        Schema::dropIfExists('stock_adjustments');
        Schema::dropIfExists('stock_opnames');

        Schema::table('transactions', function (Blueprint $table) {
            foreach ([
                'payment_verified_by',
                'voided_by',
                'cashier_shift_id',
            ] as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropConstrainedForeignId($column);
                }
            }

            foreach ([
                'status',
                'discount_per_product',
                'discount_total',
                'voided_at',
                'void_reason',
                'payment_verified_at',
            ] as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('cashier_shifts');
    }
};
