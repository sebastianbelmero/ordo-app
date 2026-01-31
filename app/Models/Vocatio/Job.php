<?php

declare(strict_types=1);

namespace App\Models\Vocatio;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    use HasUuids;

    protected $table = 'vocatio_jobs';

    protected $fillable = [
        'user_id',
        'pipeline_id',
        'status_id',
        'company',
        'position',
        'url',
        'location',
        'notes',
        'due_date',
        'level_of_interest',
        'salary_min',
        'salary_max',
        'google_calendar_event_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(JobStatus::class, 'status_id');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(JobShare::class);
    }

    /**
     * Get salary range formatted.
     */
    public function getSalaryRangeAttribute(): ?string
    {
        if (! $this->salary_min && ! $this->salary_max) {
            return null;
        }

        if ($this->salary_min && $this->salary_max) {
            return number_format($this->salary_min).' - '.number_format($this->salary_max);
        }

        if ($this->salary_min) {
            return 'From '.number_format($this->salary_min);
        }

        return 'Up to '.number_format($this->salary_max);
    }

    /**
     * Check if job status is final (offer/rejected).
     */
    public function isFinal(): bool
    {
        return $this->status?->is_final ?? false;
    }
}
