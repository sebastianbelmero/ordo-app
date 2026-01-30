<?php

declare(strict_types=1);

namespace App\Models\Opus;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $table = 'opus_projects';

    protected $fillable = [
        'workspace_id',
        'name',
        'status_id',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ProjectStatus::class, 'status_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get counts for dashboard stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'tasks_count' => $this->tasks()->count(),
            'completed_tasks_count' => $this->tasks()
                ->whereHas('status', fn ($q) => $q->where('is_completed', true))
                ->count(),
        ];
    }
}
