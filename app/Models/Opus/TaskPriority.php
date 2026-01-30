<?php

declare(strict_types=1);

namespace App\Models\Opus;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskPriority extends Model
{
    protected $table = 'opus_task_priorities';

    protected $fillable = [
        'user_id',
        'slug',
        'name',
        'color',
        'level',
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

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'priority_id');
    }
}
