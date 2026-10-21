<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\Supplier;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const RECORDS = [
        'products' => [Product::class, 'product.created'],
        'categories' => [Category::class, 'category.created'],
        'suppliers' => [Supplier::class, 'supplier.created'],
        'stock_ins' => [StockIn::class, 'stock_in.created'],
    ];

    public function up(): void
    {
        foreach (self::RECORDS as $tableName => [$model, $action]) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            });

            // Recover legacy owners only where the creation audit identifies them.
            DB::table('audit_logs')->where('subject_type', (new $model)->getMorphClass())
                ->where('action', $action)->orderBy('id')
                ->chunkById(500, function ($logs) use ($tableName): void {
                    foreach ($logs as $log) {
                        if ($log->user_id !== null) {
                            DB::table($tableName)->where('id', $log->subject_id)->whereNull('user_id')
                                ->update(['user_id' => $log->user_id]);
                        }
                    }
                });
        }
    }

    public function down(): void
    {
        foreach (array_keys(self::RECORDS) as $tableName) {
            Schema::table($tableName, fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
        }
    }
};
