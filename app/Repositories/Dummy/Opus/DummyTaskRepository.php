<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Opus;

use App\Contracts\Repositories\Opus\TaskRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY OPUS TASK REPOSITORY
 * ======================================================================================
 */
class DummyTaskRepository implements TaskRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForProject(int $projectId): array
    {
        return collect($this->dummyData->opusTasks())
            ->where('project_id', $projectId)
            ->map(function ($task) {
                $task['status'] = collect($this->dummyData->opusTaskStatuses())
                    ->firstWhere('id', $task['status_id']);
                $task['priority'] = collect($this->dummyData->opusTaskPriorities())
                    ->firstWhere('id', $task['priority_id']);

                return $task;
            })
            ->values()
            ->toArray();
    }

    public function getKanbanBoard(int $projectId, int $userId): array
    {
        $tasks = collect($this->dummyData->opusTasks())
            ->where('project_id', $projectId)
            ->toArray();

        $statuses = collect($this->dummyData->opusTaskStatuses())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values();

        return $statuses->map(function ($status) use ($tasks) {
            $status['tasks'] = collect($tasks)
                ->where('status_id', $status['id'])
                ->map(function ($task) {
                    $task['priority'] = collect($this->dummyData->opusTaskPriorities())
                        ->firstWhere('id', $task['priority_id']);

                    return $task;
                })
                ->values()
                ->toArray();

            return $status;
        })->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->opusTasks())
            ->firstWhere('id', $id);
    }

    public function findWithRelations(int $id): ?array
    {
        $task = $this->find($id);
        if (!$task) {
            return null;
        }

        $task['status'] = collect($this->dummyData->opusTaskStatuses())
            ->firstWhere('id', $task['status_id']);
        $task['priority'] = collect($this->dummyData->opusTaskPriorities())
            ->firstWhere('id', $task['priority_id']);

        return $task;
    }
}
