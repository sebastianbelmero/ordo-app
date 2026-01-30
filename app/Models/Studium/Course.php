<?php

declare(strict_types=1);

namespace App\Models\Studium;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $table = 'studium_courses';

    protected $fillable = [
        'semester_id',
        'name',
        'code',
        'credits',
        'schedule_data',
        'lecturer_name',
        'lecturer_contact',
    ];

    protected function casts(): array
    {
        return [
            'schedule_data' => 'array',
        ];
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get the program through semester.
     */
    public function program(): Program
    {
        return $this->semester->program;
    }

    /**
     * Get counts for stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'assignments_count' => $this->assignments()->count(),
            'pending_assignments_count' => $this->assignments()
                ->whereNull('grade')
                ->where('deadline', '>=', now())
                ->count(),
        ];
    }
}
