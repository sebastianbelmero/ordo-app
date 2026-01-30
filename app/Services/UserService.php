<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;

/**
 * ======================================================================================
 * USER SERVICE
 * ======================================================================================
 *
 * Service layer berisi business logic.
 *
 * KENAPA PAKAI SERVICE LAYER?
 * ---------------------------
 * 1. Controller tetap "thin" - hanya handle HTTP request/response
 * 2. Business logic terpusat dan reusable
 * 3. Mudah di-test secara terpisah
 *
 * ALUR:
 * -----
 * Controller -> Service -> Repository -> Data Source (Dummy/DB)
 *
 * - Controller: Handle HTTP (request, validation, response)
 * - Service: Business logic (aturan bisnis, transformasi data)
 * - Repository: Data access (query, CRUD)
 *
 * ======================================================================================
 */
class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get all users.
     *
     * @return array{data: array, meta: array}
     */
    public function getAllUsers(): array
    {
        $users = $this->userRepository->all();

        return [
            'data' => $users,
            'meta' => [
                'total' => count($users),
            ],
        ];
    }

    /**
     * Get single user by ID.
     */
    public function getUser(int $id): ?array
    {
        return $this->userRepository->find($id);
    }

    /**
     * Get user with all relations loaded.
     */
    public function getUserWithRelations(int $id): ?array
    {
        return $this->userRepository->findWithRelations($id, ['modules', 'roles', 'permissions']);
    }

    /**
     * Get user's enabled modules.
     *
     * @return array{data: array}
     */
    public function getUserModules(int $userId): array
    {
        return [
            'data' => $this->userRepository->getModules($userId),
        ];
    }

    /**
     * Get user's roles.
     *
     * @return array{data: array}
     */
    public function getUserRoles(int $userId): array
    {
        return [
            'data' => $this->userRepository->getRoles($userId),
        ];
    }
}
