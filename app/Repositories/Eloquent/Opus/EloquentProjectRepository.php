<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Opus;

use App\Contracts\Repositories\Opus\ProjectRepositoryInterface;
use App\Models\Opus\Project;

class EloquentProjectRepository implements ProjectRepositoryInterface
{
    public function allForWorkspace(int $workspaceId): array
    {
        return Project::where('workspace_id', $workspaceId)
            ->with('status')
            ->withCount('tasks')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        /** @var Project|null $project */
        $project = Project::find($id);

        return $project?->toArray();
    }

    public function findWithStatus(int $id): ?array
    {
        $project = Project::with('status')
            ->withCount('tasks')
            ->find($id);

        return $project?->toArray();
    }

    public function findWithTasks(int $id): ?array
    {
        $project = Project::with([
            'status',
            'workspace',
            'tasks.status',
            'tasks.priority',
        ])
            ->withCount('tasks')
            ->find($id);

        return $project?->toArray();
    }

    public function create(array $data): array
    {
        return Project::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Project|null $project */
        $project = Project::find($id);
        if (! $project) {
            return null;
        }

        $project->update($data);

        /** @var Project $fresh */
        $fresh = $project->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Project|null $project */
        $project = Project::find($id);
        if (! $project) {
            return false;
        }

        return (bool) $project->delete();
    }
}
