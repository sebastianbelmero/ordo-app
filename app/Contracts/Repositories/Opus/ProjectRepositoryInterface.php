<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Opus;

/**
 * ======================================================================================
 * OPUS PROJECT REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Opus Projects.
 * Project adalah isi dari workspace (misal: "Website PT ABC").
 *
 * ======================================================================================
 */
interface ProjectRepositoryInterface
{
    /**
     * Get all projects in a workspace.
     *
     * @return array<int, array>
     */
    public function allForWorkspace(int $workspaceId): array;

    /**
     * Find project by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find project with status relation.
     */
    public function findWithStatus(int $id): ?array;

    /**
     * Find project with all tasks.
     */
    public function findWithTasks(int $id): ?array;

    /**
     * Create a new project.
     */
    public function create(array $data): array;

    /**
     * Update a project.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a project.
     */
    public function delete(int $id): bool;
}
