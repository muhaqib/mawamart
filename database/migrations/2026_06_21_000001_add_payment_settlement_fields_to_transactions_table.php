<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payment_type')->nullable()->change();
            $table->timestamp('paid_at')->nullable()->after('payment_status');
            $table->foreignId('settled_by')->nullable()->after('paid_at')->constrained('users')->nullOnDelete();
        });

        DB::table('transactions')
            ->where('payment_status', 'paid')
            ->update([
                'paid_at' => DB::raw('created_at'),
                'settled_by' => DB::raw('user_id'),
            ]);
    }

    public function down(): void
    {
        DB::table('transactions')->whereNull('payment_type')->update(['payment_type' => 'cash']);

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('settled_by');
            $table->dropColumn('paid_at');
            $table->string('payment_type')->nullable(false)->change();
        });
    }
};
