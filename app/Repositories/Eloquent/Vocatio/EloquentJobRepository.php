<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Vocatio;

use App\Contracts\Repositories\Vocatio\JobRepositoryInterface;
use App\Models\Vocatio\Job;
use App\Models\Vocatio\JobStatus;

class EloquentJobRepository implements JobRepositoryInterface
{
    public function allForPipeline(int $pipelineId): array
    {
        return Job::where('pipeline_id', $pipelineId)
            ->with('status')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function allForUser(int $userId): array
    {
        return Job::where('user_id', $userId)
            ->with(['status', 'pipeline'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function getKanbanBoard(int $pipelineId, int $userId): array
    {
        // Get all job statuses for the user
        $statuses = JobStatus::where('user_id', $userId)
            ->orderBy('order')
            ->get();

        // Get all jobs for the pipeline
        $jobs = Job::where('pipeline_id', $pipelineId)
            ->with('status')
            ->get();

        // Group jobs by status
        $board = [];
        foreach ($statuses as $status) {
            $statusArray = $status->toArray();
            $statusArray['jobs'] = $jobs->where('status_id', $status->id)->values()->toArray();
            $board[] = $statusArray;
        }

        return $board;
    }

    public function find(string $id): ?array
    {
        $job = Job::find($id);

        return $job?->toArray();
    }

    public function findWithStatus(string $id): ?array
    {
        $job = Job::with(['status', 'pipeline'])
            ->find($id);

        return $job?->toArray();
    }

    public function getStatuses(int $userId): array
    {
        return JobStatus::where('user_id', $userId)
            ->orderBy('order')
            ->get()
            ->toArray();
    }

    public function create(array $data): array
    {
        return Job::create($data)->toArray();
    }

    public function update(string $id, array $data): ?array
    {
        /** @var Job|null $job */
        $job = Job::find($id);
        if (! $job) {
            return null;
        }

        $job->update($data);

        /** @var Job $fresh */
        $fresh = $job->fresh(['status', 'pipeline']);

        return $fresh->toArray();
    }

    public function delete(string $id): bool
    {
        /** @var Job|null $job */
        $job = Job::find($id);
        if (! $job) {
            return false;
        }

        return (bool) $job->delete();
    }

    public function updateJobStatus(string $id, int $statusId, ?int $position = null): ?array
    {
        /** @var Job|null $job */
        $job = Job::find($id);
        if (! $job) {
            return null;
        }

        $updateData = ['status_id' => $statusId];
        if ($position !== null) {
            $updateData['position'] = $position;
        }

        $job->update($updateData);

        /** @var Job $fresh */
        $fresh = $job->fresh(['status', 'pipeline']);

        return $fresh->toArray();
    }

    public function createStatus(array $data): array
    {
        return JobStatus::create($data)->toArray();
    }

    public function updateStatusEntity(int $id, array $data): ?array
    {
        $status = JobStatus::find($id);
        if ($status && !$status->is_system) {
            $status->update($data);
            return $status->fresh()->toArray();
        }
        return $status?->toArray();
    }

    public function deleteStatus(int $id): bool
    {
        $status = JobStatus::find($id);
        if ($status && !$status->is_system) {
            return $status->delete();
        }
        return false;
    }

    /**
     * Create default job statuses for a new user.
     */
    public function createDefaultStatusesForUser(int $userId): void
    {
        $statuses = [
            ['slug' => 'saved', 'name' => 'Saved', 'color' => '#64748b', 'order' => 0, 'is_system' => true, 'is_final' => false],
            ['slug' => 'applied', 'name' => 'Applied', 'color' => '#3b82f6', 'order' => 1, 'is_system' => true, 'is_final' => false],
            ['slug' => 'interview', 'name' => 'Interview', 'color' => '#8b5cf6', 'order' => 2, 'is_system' => true, 'is_final' => false],
            ['slug' => 'offer', 'name' => 'Offer', 'color' => '#22c55e', 'order' => 3, 'is_system' => true, 'is_final' => true],
            ['slug' => 'rejected', 'name' => 'Rejected', 'color' => '#ef4444', 'order' => 4, 'is_system' => true, 'is_final' => true],
        ];

        foreach ($statuses as $status) {
            JobStatus::create(array_merge($status, ['user_id' => $userId]));
        }
    }
}
