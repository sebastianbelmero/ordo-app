<?php

declare(strict_types=1);

namespace App\Contracts\Repositories\Vocatio;

/**
 * ======================================================================================
 * VOCATIO JOB SHARE REPOSITORY INTERFACE
 * ======================================================================================
 *
 * Kontrak untuk akses data Vocatio Job Shares (Fitur share ke teman).
 *
 * ======================================================================================
 */
interface JobShareRepositoryInterface
{
    /**
     * Get all shares sent by a user.
     *
     * @return array<int, array>
     */
    public function sentByUser(int $userId): array;

    /**
     * Get all shares received by a user.
     *
     * @return array<int, array>
     */
    public function receivedByUser(int $userId): array;

    /**
     * Get pending shares for a user (received, belum di-accept/decline).
     *
     * @return array<int, array>
     */
    public function pendingForUser(int $userId): array;

    /**
     * Find share by UUID.
     */
    public function find(string $id): ?array;

    /**
     * Create a new share.
     */
    public function create(array $data): array;

    /**
     * Respond to a share (accept/reject).
     */
    public function respond(string $id, string $status): ?array;

    /**
     * Delete a share.
     */
    public function delete(string $id): bool;
}
