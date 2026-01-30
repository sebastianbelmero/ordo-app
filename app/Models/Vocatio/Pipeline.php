<?php

declare(strict_types=1);

namespace App\Models\Vocatio;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pipeline extends Model
{
    protected $table = 'vocatio_pipelines';

    protected $fillable = [
        'user_id',
        'name',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    /**
     * Get counts for stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'jobs_count' => $this->jobs()->count(),
            'active_jobs_count' => $this->jobs()
                ->whereHas('status', fn ($q) => $q->where('is_final', false))
                ->count(),
        ];
    }
}
