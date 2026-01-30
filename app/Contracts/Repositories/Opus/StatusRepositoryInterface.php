<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Opus;

/**
 * ======================================================================================
 * OPUS STATUS REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Opus Statuses (Project & Task statuses).
 *
 * ======================================================================================
 */
interface StatusRepositoryInterface
{
    /**
     * Get all project statuses for a user.
     *
     * @return array<int, array>
     */
    public function getProjectStatuses(int $userId): array;

    /**
     * Get all task statuses for a user.
     *
     * @return array<int, array>
     */
    public function getTaskStatuses(int $userId): array;

    /**
     * Get all task priorities for a user.
     *
     * @return array<int, array>
     */
    public function getTaskPriorities(int $userId): array;

    /**
     * Find project status by ID.
     */
    public function findProjectStatus(int $id): ?array;

    /**
     * Find task status by ID.
     */
    public function findTaskStatus(int $id): ?array;

    /**
     * Find task priority by ID.
     */
    public function findTaskPriority(int $id): ?array;

    /**
     * Create a project status.
     */
    public function createProjectStatus(array $data): array;

    /**
     * Update a project status.
     */
    public function updateProjectStatus(int $id, array $data): ?array;

    /**
     * Delete a project status.
     */
    public function deleteProjectStatus(int $id): bool;

    /**
     * Create a task status.
     */
    public function createTaskStatus(array $data): array;

    /**
     * Update a task status.
     */
    public function updateTaskStatus(int $id, array $data): ?array;

    /**
     * Delete a task status.
     */
    public function deleteTaskStatus(int $id): bool;

    /**
     * Create a task priority.
     */
    public function createTaskPriority(array $data): array;

    /**
     * Update a task priority.
     */
    public function updateTaskPriority(int $id, array $data): ?array;

    /**
     * Delete a task priority.
     */
    public function deleteTaskPriority(int $id): bool;

    /**
     * Create default statuses and priorities for a new user.
     */
    public function createDefaultsForUser(int $userId): void;
}
