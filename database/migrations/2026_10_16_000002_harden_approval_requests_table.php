<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('approval_requests', function (Blueprint $table): void {
            $table->timestamp('subject_updated_at')->nullable()->after('subject_id');
            $table->string('subject_fingerprint', 64)->nullable()->after('subject_updated_at');
            $table->string('pending_key', 64)->nullable()->unique()->after('status');
        });

        DB::table('approval_requests')
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'review_notes' => 'Permintaan lama dibatalkan saat peningkatan keamanan approval.',
                'reviewed_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('approval_requests', function (Blueprint $table): void {
            $table->dropUnique(['pending_key']);
            $table->dropColumn(['subject_updated_at', 'subject_fingerprint', 'pending_key']);
        });
    }
};
