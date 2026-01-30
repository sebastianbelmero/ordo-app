<?php

declare(strict_types=1);

namespace App\Models\Studium;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssignmentType extends Model
{
    protected $table = 'studium_assignment_types';

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

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'type_id');
    }
}
