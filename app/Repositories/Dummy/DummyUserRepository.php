<?php

declare(strict_types=1);

namespace App\Repositories\Dummy;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY USER REPOSITORY
 * ======================================================================================
 *
 * Implementasi UserRepositoryInterface menggunakan DummyData.
 *
 * PENJELASAN ARSITEKTUR:
 * ----------------------
 * Repository ini adalah implementasi KONKRET dari interface.
 * Saat Anda mau switch ke database asli, buat class baru:
 *
 *   App\Repositories\Eloquent\EloquentUserRepository
 *
 * Yang juga implements UserRepositoryInterface, tapi menggunakan Eloquent Model.
 *
 * ======================================================================================
 */
class DummyUserRepository implements UserRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function all(): array
    {
        return $this->dummyData->users();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->users())
            ->firstWhere('id', $id);
    }

    public function findWithRelations(int $id, array $relations = []): ?array
    {
        $user = $this->find($id);
        if (!$user) {
            return null;
        }

        // Load modules jika diminta
        if (in_array('modules', $relations)) {
            $user['modules'] = $this->getModules($id);
        }

        // Load roles jika diminta
        if (in_array('roles', $relations)) {
            $user['roles'] = $this->getRoles($id);
        }

        // Load permissions jika diminta
        if (in_array('permissions', $relations)) {
            $user['permissions'] = $this->getPermissions($id);
        }

        return $user;
    }

    public function findByEmail(string $email): ?array
    {
        return collect($this->dummyData->users())
            ->firstWhere('email', $email);
    }

    public function getModules(int $userId): array
    {
        return collect($this->dummyData->userModules())
            ->where('user_id', $userId)
            ->where('is_enabled', true)
            ->sortBy('order')
            ->values()
            ->toArray();
    }

    public function getRoles(int $userId): array
    {
        $roleIds = collect($this->dummyData->modelHasRoles())
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $userId)
            ->pluck('role_id')
            ->toArray();

        return collect($this->dummyData->roles())
            ->whereIn('id', $roleIds)
            ->values()
            ->toArray();
    }

    public function getPermissions(int $userId): array
    {
        // Get direct permissions
        $directPermissionIds = collect($this->dummyData->modelHasPermissions())
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $userId)
            ->pluck('permission_id')
            ->toArray();

        // Get permissions via roles
        $roleIds = collect($this->dummyData->modelHasRoles())
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $userId)
            ->pluck('role_id')
            ->toArray();

        $rolePermissionIds = collect($this->dummyData->roleHasPermissions())
            ->whereIn('role_id', $roleIds)
            ->pluck('permission_id')
            ->toArray();

        // Merge and unique
        $allPermissionIds = array_unique(array_merge($directPermissionIds, $rolePermissionIds));

        return collect($this->dummyData->permissions())
            ->whereIn('id', $allPermissionIds)
            ->values()
            ->toArray();
    }
}
