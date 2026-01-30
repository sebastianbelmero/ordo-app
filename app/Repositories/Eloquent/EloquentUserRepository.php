<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * ======================================================================================
 * ELOQUENT USER REPOSITORY
 * ======================================================================================
 *
 * Implementasi UserRepositoryInterface menggunakan Eloquent.
 *
 * ======================================================================================
 */
class EloquentUserRepository implements UserRepositoryInterface
{
    public function all(): array
    {
        /** @var Collection<int, User> $users */
        $users = User::all();

        return $users->toArray();
    }

    public function find(int $id): ?array
    {
        /** @var User|null $user */
        $user = User::find($id);

        return $user?->toArray();
    }

    public function findWithRelations(int $id, array $relations = []): ?array
    {
        $query = User::query();

        // Map relation names to actual Eloquent relations
        $relationMap = [
            'modules' => 'modules',
            'roles' => 'roles',
            'permissions' => 'permissions',
        ];

        $loadRelations = [];
        foreach ($relations as $relation) {
            if (isset($relationMap[$relation])) {
                $loadRelations[] = $relationMap[$relation];
            }
        }

        if (! empty($loadRelations)) {
            $query->with($loadRelations);
        }

        /** @var User|null $user */
        $user = $query->find($id);

        return $user?->toArray();
    }

    public function findByEmail(string $email): ?array
    {
        /** @var User|null $user */
        $user = User::where('email', $email)->first();

        return $user?->toArray();
    }

    public function getModules(int $userId): array
    {
        /** @var User|null $user */
        $user = User::find($userId);

        if (! $user) {
            return [];
        }

        return $user->modules()
            ->where('is_enabled', true)
            ->orderBy('order')
            ->get()
            ->toArray();
    }

    public function getRoles(int $userId): array
    {
        /** @var User|null $user */
        $user = User::find($userId);

        if (! $user) {
            return [];
        }

        return $user->roles()->get()->toArray();
    }

    public function getPermissions(int $userId): array
    {
        /** @var User|null $user */
        $user = User::find($userId);

        if (! $user) {
            return [];
        }

        return $user->getAllPermissions()->toArray();
    }
}
