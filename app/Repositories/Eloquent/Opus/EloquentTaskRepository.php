<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Opus;

use App\Contracts\Repositories\Opus\TaskRepositoryInterface;
use App\Models\Opus\Task;
use App\Models\Opus\TaskStatus;

class EloquentTaskRepository implements TaskRepositoryInterface
{
    public function allForProject(int $projectId): array
    {
        return Task::where('project_id', $projectId)
            ->with(['status', 'priority'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function getKanbanBoard(int $projectId, int $userId): array
    {
        // Get all task statuses for the user
        $statuses = TaskStatus::where('user_id', $userId)
            ->orderBy('order')
            ->get();

        // Get all tasks for the project
        $tasks = Task::where('project_id', $projectId)
            ->with(['status', 'priority'])
            ->get();

        // Group tasks by status - return status with tasks embedded
        $board = [];
        foreach ($statuses as $status) {
            $statusArray = $status->toArray();
            $statusArray['tasks'] = $tasks->where('status_id', $status->id)->values()->toArray();
            $board[] = $statusArray;
        }

        return $board;
    }

    public function find(int $id): ?array
    {
        $task = Task::find($id);

        return $task?->toArray();
    }

    public function findWithRelations(int $id): ?array
    {
        $task = Task::with(['status', 'priority', 'project.workspace'])
            ->find($id);

        return $task?->toArray();
    }

    public function create(array $data): array
    {
        return Task::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Task|null $task */
        $task = Task::find($id);
        if (! $task) {
            return null;
        }

        $task->update($data);

        /** @var Task $fresh */
        $fresh = $task->fresh(['status', 'priority']);

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Task|null $task */
        $task = Task::find($id);
        if (! $task) {
            return false;
        }

        return (bool) $task->delete();
    }

    public function updateStatus(int $id, int $statusId, ?int $position = null): ?array
    {
        /** @var Task|null $task */
        $task = Task::find($id);
        if (! $task) {
            return null;
        }

        $updateData = ['status_id' => $statusId];
        if ($position !== null) {
            $updateData['position'] = $position;
        }

        $task->update($updateData);

        /** @var Task $fresh */
        $fresh = $task->fresh(['status', 'priority']);

        return $fresh->toArray();
    }
}
