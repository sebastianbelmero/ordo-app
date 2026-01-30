<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Studium;

/**
 * ======================================================================================
 * STUDIUM COURSE REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Studium Courses (Mata Kuliah).
 *
 * ======================================================================================
 */
interface CourseRepositoryInterface
{
    /**
     * Get all courses for a semester.
     *
     * @return array<int, array>
     */
    public function allForSemester(int $semesterId): array;

    /**
     * Find course by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find course with assignments.
     */
    public function findWithAssignments(int $id): ?array;

    /**
     * Create a new course.
     */
    public function create(array $data): array;

    /**
     * Update a course.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a course.
     */
    public function delete(int $id): bool;
}
