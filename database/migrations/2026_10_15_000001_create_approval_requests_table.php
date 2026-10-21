<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereNotIn('role', ['admin', 'cashier'])->update(['role' => 'cashier']);

        Schema::create('approval_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->morphs('subject');
            $table->string('action');
            $table->json('payload')->nullable();
            $table->json('files')->nullable();
            $table->string('status')->default('pending')->index();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_requests');
    }
};
