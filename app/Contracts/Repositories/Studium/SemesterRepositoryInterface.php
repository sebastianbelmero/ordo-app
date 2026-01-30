<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Studium;

/**
 * ======================================================================================
 * STUDIUM SEMESTER REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Studium Semesters.
 *
 * ======================================================================================
 */
interface SemesterRepositoryInterface
{
    /**
     * Get all semesters for a program.
     *
     * @return array<int, array>
     */
    public function allForProgram(int $programId): array;

    /**
     * Find semester by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find active semester for a program.
     */
    public function findActive(int $programId): ?array;

    /**
     * Find semester with courses.
     */
    public function findWithCourses(int $id): ?array;

    /**
     * Create a new semester.
     */
    public function create(array $data): array;

    /**
     * Update a semester.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a semester.
     */
    public function delete(int $id): bool;
}
