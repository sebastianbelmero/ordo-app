<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Vocatio;

use App\Contracts\Repositories\Vocatio\JobShareRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY VOCATIO JOB SHARE REPOSITORY
 * ======================================================================================
 */
class DummyJobShareRepository implements JobShareRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function sentByUser(int $userId): array
    {
        return collect($this->dummyData->vocatioJobShares())
            ->where('sender_id', $userId)
            ->map(function ($share) {
                $share['job'] = collect($this->dummyData->vocatioJobs())
                    ->firstWhere('id', $share['job_id']);
                $share['receiver'] = collect($this->dummyData->users())
                    ->firstWhere('id', $share['receiver_id']);

                return $share;
            })
            ->values()
            ->toArray();
    }

    public function receivedByUser(int $userId): array
    {
        return collect($this->dummyData->vocatioJobShares())
            ->where('receiver_id', $userId)
            ->map(function ($share) {
                $share['job'] = collect($this->dummyData->vocatioJobs())
                    ->firstWhere('id', $share['job_id']);
                $share['sender'] = collect($this->dummyData->users())
                    ->firstWhere('id', $share['sender_id']);

                return $share;
            })
            ->values()
            ->toArray();
    }

    public function pendingForUser(int $userId): array
    {
        return collect($this->dummyData->vocatioJobShares())
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->map(function ($share) {
                $share['job'] = collect($this->dummyData->vocatioJobs())
                    ->firstWhere('id', $share['job_id']);
                $share['sender'] = collect($this->dummyData->users())
                    ->firstWhere('id', $share['sender_id']);

                return $share;
            })
            ->values()
            ->toArray();
    }

    public function find(string $id): ?array
    {
        $share = collect($this->dummyData->vocatioJobShares())
            ->firstWhere('id', $id);

        if (!$share) {
            return null;
        }

        $share['job'] = collect($this->dummyData->vocatioJobs())
            ->firstWhere('id', $share['job_id']);
        $share['sender'] = collect($this->dummyData->users())
            ->firstWhere('id', $share['sender_id']);
        $share['receiver'] = collect($this->dummyData->users())
            ->firstWhere('id', $share['receiver_id']);

        return $share;
    }
}
