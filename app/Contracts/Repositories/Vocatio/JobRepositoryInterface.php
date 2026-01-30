<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Vocatio;

/**
 * ======================================================================================
 * VOCATIO JOB REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Vocatio Jobs (Kartu Lamaran).
 *
 * ======================================================================================
 */
interface JobRepositoryInterface
{
    /**
     * Get all jobs for a pipeline.
     *
     * @return array<int, array>
     */
    public function allForPipeline(int $pipelineId): array;

    /**
     * Get all jobs for a user.
     *
     * @return array<int, array>
     */
    public function allForUser(int $userId): array;

    /**
     * Get jobs grouped by status (for Kanban board).
     *
     * @return array<int, array{status: array, jobs: array}>
     */
    public function getKanbanBoard(int $pipelineId, int $userId): array;

    /**
     * Find job by UUID.
     */
    public function find(string $id): ?array;

    /**
     * Find job with status relation.
     */
    public function findWithStatus(string $id): ?array;

    /**
     * Get job statuses for a user.
     *
     * @return array<int, array>
     */
    public function getStatuses(int $userId): array;

    /**
     * Create a new job.
     */
    public function create(array $data): array;

    /**
     * Update a job.
     */
    public function update(string $id, array $data): ?array;

    /**
     * Update job status (for Kanban drag & drop).
     */
    public function updateJobStatus(string $id, int $statusId, ?int $position = null): ?array;

    /**
     * Delete a job.
     */
    public function delete(string $id): bool;

    /**
     * Create a job status.
     */
    public function createStatus(array $data): array;

    /**
     * Update a job status entity.
     */
    public function updateStatusEntity(int $id, array $data): ?array;

    /**
     * Delete a job status.
     */
    public function deleteStatus(int $id): bool;

    /**
     * Create default statuses for a new user.
     */
    public function createDefaultStatusesForUser(int $userId): void;
}
