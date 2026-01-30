<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Vocatio;

/**
 * ======================================================================================
 * VOCATIO PIPELINE REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Vocatio Pipelines.
 * Pipeline adalah wadah/grup untuk lowongan (misal: "Loker IT 2026").
 *
 * ======================================================================================
 */
interface PipelineRepositoryInterface
{
    /**
     * Get all pipelines for a user.
     *
     * @return array<int, array>
     */
    public function allForUser(int $userId): array;

    /**
     * Find pipeline by ID.
     */
    public function find(int $id): ?array;

    /**
     * Find pipeline with jobs.
     */
    public function findWithJobs(int $id): ?array;

    /**
     * Find default pipeline for a user.
     */
    public function findDefault(int $userId): ?array;

    /**
     * Create a new pipeline.
     */
    public function create(array $data): array;

    /**
     * Update a pipeline.
     */
    public function update(int $id, array $data): ?array;

    /**
     * Delete a pipeline.
     */
    public function delete(int $id): bool;
}
