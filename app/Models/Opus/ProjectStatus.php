<?php

declare(strict_types=1);

namespace App\Models\Opus;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectStatus extends Model
{
    protected $table = 'opus_project_statuses';

    protected $fillable = [
        'user_id',
        'slug',
        'name',
        'color',
        'order',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'status_id');
    }
}
