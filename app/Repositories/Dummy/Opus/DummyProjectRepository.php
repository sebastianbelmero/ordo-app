<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Opus;

use App\Contracts\Repositories\Opus\ProjectRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY OPUS PROJECT REPOSITORY
 * ======================================================================================
 */
class DummyProjectRepository implements ProjectRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForWorkspace(int $workspaceId): array
    {
        return collect($this->dummyData->opusProjects())
            ->where('workspace_id', $workspaceId)
            ->map(function ($project) {
                $project['status'] = collect($this->dummyData->opusProjectStatuses())
                    ->firstWhere('id', $project['status_id']);

                return $project;
            })
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->opusProjects())
            ->firstWhere('id', $id);
    }

    public function findWithStatus(int $id): ?array
    {
        $project = $this->find($id);
        if (!$project) {
            return null;
        }

        $project['status'] = collect($this->dummyData->opusProjectStatuses())
            ->firstWhere('id', $project['status_id']);

        return $project;
    }

    public function findWithTasks(int $id): ?array
    {
        $project = $this->findWithStatus($id);
        if (!$project) {
            return null;
        }

        $project['tasks'] = collect($this->dummyData->opusTasks())
            ->where('project_id', $id)
            ->map(function ($task) {
                $task['status'] = collect($this->dummyData->opusTaskStatuses())
                    ->firstWhere('id', $task['status_id']);
                $task['priority'] = collect($this->dummyData->opusTaskPriorities())
                    ->firstWhere('id', $task['priority_id']);

                return $task;
            })
            ->values()
            ->toArray();

        return $project;
    }
}
