<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Opus;

/**
 * ======================================================================================
 * OPUS TASK REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Opus Tasks.
 * Task adalah kartu Kanban dalam project.
 *
 * ======================================================================================
 */
interface TaskRepositoryInterface
{
    /**
     * Get all tasks in a project.
     *
     * @return array<int, array>
     */
    public function allForProject(int $projectId): array;

    /**
     * Get tasks grouped by status (for Kanban board).
     *
     * @return array<int, array{status: array, tasks: array}>
     */
    public function getKanbanBoard(int $projectId, int $userId): array;

    /**
     * Find task by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find task with status and priority relations.
     */
    public function findWithRelations(int $id): ?array;

    /**
     * Create a new task.
     */
    public function create(array $data): array;

    /**
     * Update a task.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Update task status (for Kanban drag & drop).
     */
    public function updateStatus(int $id, int $statusId, ?int $position = null): ?array;

    /**
     * Delete a task.
     */
    public function delete(int $id): bool;
}
