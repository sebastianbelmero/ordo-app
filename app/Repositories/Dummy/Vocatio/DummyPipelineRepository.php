<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Vocatio;

use App\Contracts\Repositories\Vocatio\PipelineRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY VOCATIO PIPELINE REPOSITORY
 * ======================================================================================
 */
class DummyPipelineRepository implements PipelineRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForUser(int $userId): array
    {
        return collect($this->dummyData->vocatioPipelines())
            ->where('user_id', $userId)
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->vocatioPipelines())
            ->firstWhere('id', $id);
    }

    public function findWithJobs(int $id): ?array
    {
        $pipeline = $this->find($id);
        if (!$pipeline) {
            return null;
        }

        $pipeline['jobs'] = collect($this->dummyData->vocatioJobs())
            ->where('pipeline_id', $id)
            ->map(function ($job) {
                $job['status'] = collect($this->dummyData->vocatioJobStatuses())
                    ->firstWhere('id', $job['status_id']);

                return $job;
            })
            ->values()
            ->toArray();

        return $pipeline;
    }

    public function findDefault(int $userId): ?array
    {
        return collect($this->dummyData->vocatioPipelines())
            ->where('user_id', $userId)
            ->where('is_default', true)
            ->first();
    }
}
