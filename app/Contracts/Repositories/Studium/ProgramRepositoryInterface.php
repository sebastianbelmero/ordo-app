<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Studium;

/**
 * ======================================================================================
 * STUDIUM PROGRAM REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Studium Programs.
 * Program adalah program studi (misal: "S2 MBA Unpar").
 *
 * ======================================================================================
 */
interface ProgramRepositoryInterface
{
    /**
     * Get all programs for a user.
     *
     * @return array<int, array>
     */
    public function allForUser(int $userId): array;

    /**
     * Find program by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find program with semesters.
     */
    public function findWithSemesters(int $id): ?array;

    /**
     * Find program with full hierarchy (semesters > courses > assignments).
     */
    public function findWithFullHierarchy(int $id): ?array;

    /**
     * Create a new program.
     */
    public function create(array $data): array;

    /**
     * Update a program.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a program.
     */
    public function delete(int $id): bool;
}
