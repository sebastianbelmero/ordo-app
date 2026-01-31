<?php

declare(strict_types=1);

namespace App\Models\Studium;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assignment extends Model
{
    protected $table = 'studium_assignments';

    protected $fillable = [
        'course_id',
        'title',
        'type_id',
        'deadline',
        'grade',
        'google_calendar_event_id',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'grade' => 'decimal:2',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(AssignmentType::class, 'type_id');
    }

    /**
     * Check if assignment is completed (has grade).
     */
    public function isCompleted(): bool
    {
        return $this->grade !== null;
    }

    /**
     * Check if assignment is overdue.
     */
    public function isOverdue(): bool
    {
        if (! $this->deadline) {
            return false;
        }

        return $this->deadline->isPast() && ! $this->isCompleted();
    }

    /**
     * Check if assignment is upcoming (within next 7 days).
     */
    public function isUpcoming(): bool
    {
        if (! $this->deadline) {
            return false;
        }

        return $this->deadline->isBetween(now(), now()->addDays(7)) && ! $this->isCompleted();
    }

    /**
     * Scope for upcoming assignments.
     */
    public function scopeUpcoming($query)
    {
        return $query->whereNull('grade')
            ->whereNotNull('deadline')
            ->where('deadline', '>=', now())
            ->orderBy('deadline');
    }
}
