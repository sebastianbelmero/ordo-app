<?php

declare(strict_types=1);

namespace App\Models\Vocatio;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobShare extends Model
{
    use HasUuids;

    protected $table = 'vocatio_job_shares';

    protected $fillable = [
        'job_id',
        'sender_id',
        'receiver_id',
        'message',
        'status',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Check if share is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if share is accepted.
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if share is declined.
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    /**
     * Accept the share.
     */
    public function accept(): void
    {
        $this->update(['status' => 'accepted']);
    }

    /**
     * Decline the share.
     */
    public function decline(): void
    {
        $this->update(['status' => 'declined']);
    }
}
