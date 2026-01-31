<?php

declare(strict_types=1);

namespace App\Models\Opus;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $table = 'opus_tasks';

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status_id',
        'priority_id',
        'due_date',
        'meta',
        'google_calendar_event_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TaskStatus::class, 'status_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(TaskPriority::class, 'priority_id');
    }

    /**
     * Check if task is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status?->is_completed ?? false;
    }

    /**
     * Check if task is overdue.
     */
    public function isOverdue(): bool
    {
        if (! $this->due_date) {
            return false;
        }

        return $this->due_date->isPast() && ! $this->isCompleted();
    }
}
