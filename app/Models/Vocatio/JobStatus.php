<?php

declare(strict_types=1);

namespace App\Models\Vocatio;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobStatus extends Model
{
    protected $table = 'vocatio_job_statuses';

    protected $fillable = [
        'user_id',
        'slug',
        'name',
        'color',
        'order',
        'is_system',
        'is_final',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_final' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'status_id');
    }
}
