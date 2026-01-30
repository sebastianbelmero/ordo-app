<?php

declare(strict_types=1);

namespace App\Models\Opus;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskStatus extends Model
{
    protected $table = 'opus_task_statuses';

    protected $fillable = [
        'user_id',
        'slug',
        'name',
        'color',
        'order',
        'is_system',
        'is_completed',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_completed' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'status_id');
    }
}
