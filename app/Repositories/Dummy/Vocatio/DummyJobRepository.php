<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Vocatio;

use App\Contracts\Repositories\Vocatio\JobRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY VOCATIO JOB REPOSITORY
 * ======================================================================================
 */
class DummyJobRepository implements JobRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForPipeline(int $pipelineId): array
    {
        return collect($this->dummyData->vocatioJobs())
            ->where('pipeline_id', $pipelineId)
            ->map(function ($job) {
                $job['status'] = collect($this->dummyData->vocatioJobStatuses())
                    ->firstWhere('id', $job['status_id']);

                return $job;
            })
            ->values()
            ->toArray();
    }

    public function allForUser(int $userId): array
    {
        return collect($this->dummyData->vocatioJobs())
            ->where('user_id', $userId)
            ->map(function ($job) {
                $job['status'] = collect($this->dummyData->vocatioJobStatuses())
                    ->firstWhere('id', $job['status_id']);
                $job['pipeline'] = collect($this->dummyData->vocatioPipelines())
                    ->firstWhere('id', $job['pipeline_id']);

                return $job;
            })
            ->values()
            ->toArray();
    }

    public function getKanbanBoard(int $pipelineId, int $userId): array
    {
        $jobs = collect($this->dummyData->vocatioJobs())
            ->where('pipeline_id', $pipelineId)
            ->toArray();

        $statuses = collect($this->dummyData->vocatioJobStatuses())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values();

        return $statuses->map(function ($status) use ($jobs) {
            $status['jobs'] = collect($jobs)
                ->where('status_id', $status['id'])
                ->values()
                ->toArray();

            return $status;
        })->toArray();
    }

    public function find(string $id): ?array
    {
        return collect($this->dummyData->vocatioJobs())
            ->firstWhere('id', $id);
    }

    public function findWithStatus(string $id): ?array
    {
        $job = $this->find($id);
        if (!$job) {
            return null;
        }

        $job['status'] = collect($this->dummyData->vocatioJobStatuses())
            ->firstWhere('id', $job['status_id']);
        $job['pipeline'] = collect($this->dummyData->vocatioPipelines())
            ->firstWhere('id', $job['pipeline_id']);

        return $job;
    }

    public function getStatuses(int $userId): array
    {
        return collect($this->dummyData->vocatioJobStatuses())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values()
            ->toArray();
    }
}
