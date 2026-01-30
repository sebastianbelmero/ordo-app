<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Opus;

use App\Contracts\Repositories\Opus\StatusRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY OPUS STATUS REPOSITORY
 * ======================================================================================
 */
class DummyStatusRepository implements StatusRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function getProjectStatuses(int $userId): array
    {
        return collect($this->dummyData->opusProjectStatuses())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values()
            ->toArray();
    }

    public function getTaskStatuses(int $userId): array
    {
        return collect($this->dummyData->opusTaskStatuses())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values()
            ->toArray();
    }

    public function getTaskPriorities(int $userId): array
    {
        return collect($this->dummyData->opusTaskPriorities())
            ->where('user_id', $userId)
            ->sortBy('level')
            ->values()
            ->toArray();
    }

    public function findProjectStatus(int $id): ?array
    {
        return collect($this->dummyData->opusProjectStatuses())
            ->firstWhere('id', $id);
    }

    public function findTaskStatus(int $id): ?array
    {
        return collect($this->dummyData->opusTaskStatuses())
            ->firstWhere('id', $id);
    }

    public function findTaskPriority(int $id): ?array
    {
        return collect($this->dummyData->opusTaskPriorities())
            ->firstWhere('id', $id);
    }
}
