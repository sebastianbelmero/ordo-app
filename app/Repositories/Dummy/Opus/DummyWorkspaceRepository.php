<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Opus;

use App\Contracts\Repositories\Opus\WorkspaceRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY OPUS WORKSPACE REPOSITORY
 * ======================================================================================
 */
class DummyWorkspaceRepository implements WorkspaceRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForUser(int $userId): array
    {
        return collect($this->dummyData->opusWorkspaces())
            ->where('user_id', $userId)
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->opusWorkspaces())
            ->firstWhere('id', $id);
    }

    public function findWithProjects(int $id): ?array
    {
        $workspace = $this->find($id);
        if (!$workspace) {
            return null;
        }

        $workspace['projects'] = collect($this->dummyData->opusProjects())
            ->where('workspace_id', $id)
            ->map(function ($project) {
                // Attach status
                $project['status'] = collect($this->dummyData->opusProjectStatuses())
                    ->firstWhere('id', $project['status_id']);

                return $project;
            })
            ->values()
            ->toArray();

        return $workspace;
    }

    public function findWithProjectsAndTasks(int $id): ?array
    {
        $workspace = $this->find($id);
        if (!$workspace) {
            return null;
        }

        $workspace['projects'] = collect($this->dummyData->opusProjects())
            ->where('workspace_id', $id)
            ->map(function ($project) {
                // Attach status
                $project['status'] = collect($this->dummyData->opusProjectStatuses())
                    ->firstWhere('id', $project['status_id']);

                // Attach tasks
                $project['tasks'] = collect($this->dummyData->opusTasks())
                    ->where('project_id', $project['id'])
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
            })
            ->values()
            ->toArray();

        return $workspace;
    }
}
