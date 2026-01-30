<?php

declare(strict_types=1);

namespace App\Models\Studium;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Program extends Model
{
    protected $table = 'studium_programs';

    protected $fillable = [
        'user_id',
        'name',
        'institution',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    public function courses(): HasManyThrough
    {
        return $this->hasManyThrough(Course::class, Semester::class);
    }

    /**
     * Get the active semester.
     */
    public function activeSemester(): ?Semester
    {
        return $this->semesters()->where('is_active', true)->first();
    }

    /**
     * Get counts for stats.
     */
    public function getStatsAttribute(): array
    {
        return [
            'semesters_count' => $this->semesters()->count(),
            'courses_count' => $this->courses()->count(),
        ];
    }
}
