<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalRequest extends Model
{
    protected $fillable = [
        'requester_id',
        'reviewer_id',
        'subject_type',
        'subject_id',
        'action',
        'payload',
        'files',
        'status',
        'subject_updated_at',
        'subject_fingerprint',
        'pending_key',
        'review_notes',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'files' => 'array',
            'subject_updated_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
