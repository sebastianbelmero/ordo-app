<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Opus;

use App\Contracts\Repositories\Opus\WorkspaceRepositoryInterface;
use App\Models\Opus\Workspace;

class EloquentWorkspaceRepository implements WorkspaceRepositoryInterface
{
    public function allForUser(int $userId): array
    {
        return Workspace::where('user_id', $userId)
            ->withCount(['projects', 'tasks'])
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $workspace = Workspace::find($id);

        return $workspace?->toArray();
    }

    public function findWithProjects(int $id): ?array
    {
        $workspace = Workspace::with(['projects.status'])
            ->withCount(['projects', 'tasks'])
            ->find($id);

        return $workspace?->toArray();
    }

    public function findWithProjectsAndTasks(int $id): ?array
    {
        $workspace = Workspace::with([
            'projects.status',
            'projects.tasks.status',
            'projects.tasks.priority',
        ])
            ->withCount(['projects', 'tasks'])
            ->find($id);

        return $workspace?->toArray();
    }

    public function create(array $data): array
    {
        return Workspace::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Workspace|null $workspace */
        $workspace = Workspace::find($id);
        if (! $workspace) {
            return null;
        }

        $workspace->update($data);

        /** @var Workspace $fresh */
        $fresh = $workspace->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Workspace|null $workspace */
        $workspace = Workspace::find($id);
        if (! $workspace) {
            return false;
        }

        return (bool) $workspace->delete();
    }
}
