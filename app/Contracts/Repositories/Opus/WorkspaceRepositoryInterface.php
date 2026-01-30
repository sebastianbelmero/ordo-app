<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Opus;

/**
 * ======================================================================================
 * OPUS WORKSPACE REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Opus Workspaces.
 * Workspace adalah wadah besar untuk proyek (misal: "Kantor", "Freelance").
 *
 * ======================================================================================
 */
interface WorkspaceRepositoryInterface
{
    /**
     * Get all workspaces for a user.
     *
     * @return array<int, array>
     */
    public function allForUser(int $userId): array;

    /**
     * Find workspace by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find workspace with projects.
     */
    public function findWithProjects(int $id): ?array;

    /**
     * Find workspace with projects and their tasks (full nested).
     */
    public function findWithProjectsAndTasks(int $id): ?array;

    /**
     * Create a new workspace.
     */
    public function create(array $data): array;

    /**
     * Update a workspace.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a workspace.
     */
    public function delete(int $id): bool;
}
