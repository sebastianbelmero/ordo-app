<?php

declare(strict_types=1);

namespace App\Contracts\Repositories;

/**
 * ======================================================================================
 * USER REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Interface ini mendefinisikan kontrak untuk akses data User.
 *
 * KENAPA PAKAI INTERFACE?
 * -----------------------
 * 1. Dependency Inversion Principle (SOLID) - Controller/Service bergantung pada
 *    abstraksi (interface), bukan implementasi konkret.
 *
 * 2. Mudah di-swap - Saat mau ganti dari DummyData ke Eloquent, cukup:
 *    - Buat class baru yang implements interface ini
 *    - Ubah binding di ServiceProvider
 *
 * 3. Testable - Mudah di-mock saat unit testing
 *
 * CARA KERJA:
 * -----------
 * Controller -> Service -> Repository (Interface) -> Implementasi (Dummy/Eloquent)
 *
 * ======================================================================================
 */
interface UserRepositoryInterface
{
    /**
     * Get all users.
     *
     * @return array<int, array>
     */
    public function all(): array;

    /**
     * Find user by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find user by ID with relations.
     *
     * @param  array<string>  $relations  Relations to load (e.g., ['modules', 'roles'])
     */
    public function findWithRelations(int $id, array $relations = []): ?array;

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?array;

    /**
     * Get user's enabled modules.
     *
     * @return array<int, array>
     */
    public function getModules(int $userId): array;

    /**
     * Get user's roles.
     *
     * @return array<int, array>
     */
    public function getRoles(int $userId): array;

    /**
     * Get user's permissions (direct + via roles).
     *
     * @return array<int, array>
     */
    public function getPermissions(int $userId): array;
}
