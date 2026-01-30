<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Studium;

/**
 * ======================================================================================
 * STUDIUM ASSIGNMENT REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Studium Assignments (Tugas, Kuis, UTS, UAS).
 *
 * ======================================================================================
 */
interface AssignmentRepositoryInterface
{
    /**
     * Get all assignments for a course.
     *
     * @return array<int, array>
     */
    public function allForCourse(int $courseId): array;

    /**
     * Find assignment by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find assignment with type relation.
     */
    public function findWithType(int $id): ?array;

    /**
     * Get upcoming assignments for a user (deadline in the future).
     *
     * @return array<int, array>
     */
    public function getUpcoming(int $userId, int $limit = 10): array;

    /**
     * Get assignment types for a user.
     *
     * @return array<int, array>
     */
    public function getTypes(int $userId): array;

    /**
     * Create a new assignment.
     */
    public function create(array $data): array;

    /**
     * Update an assignment.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete an assignment.
     */
    public function delete(int $id): bool;

    /**
     * Create an assignment type.
     */
    public function createType(array $data): array;

    /**
     * Update an assignment type.
     */
    public function updateType(int $id, array $data): ?array;

    /**
     * Delete an assignment type.
     */
    public function deleteType(int $id): bool;

    /**
     * Create default assignment types for a new user.
     */
    public function createDefaultTypesForUser(int $userId): void;
}
