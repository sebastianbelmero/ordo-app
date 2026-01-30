<?php

declare(strict_types=1);

namespace App\Models\Studium;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Semester extends Model
{
    protected $table = 'studium_semesters';

    protected $fillable = [
        'program_id',
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function assignments(): HasManyThrough
    {
        return $this->hasManyThrough(Assignment::class, Course::class);
    }

    /**
     * Get counts for stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'courses_count' => $this->courses()->count(),
            'assignments_count' => $this->assignments()->count(),
        ];
    }
}
