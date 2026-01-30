<?php

declare(strict_types=1);

namespace App\Models\Opus;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Workspace extends Model
{
    protected $table = 'opus_workspaces';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(Task::class, Project::class);
    }

    /**
     * Get counts for dashboard stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'projects_count' => $this->projects()->count(),
            'tasks_count' => $this->tasks()->count(),
        ];
    }
}
