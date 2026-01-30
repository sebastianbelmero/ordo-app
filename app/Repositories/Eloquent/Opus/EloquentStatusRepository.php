<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Opus;

use App\Contracts\Repositories\Opus\StatusRepositoryInterface;
use App\Models\Opus\ProjectStatus;
use App\Models\Opus\TaskPriority;
use App\Models\Opus\TaskStatus;

class EloquentStatusRepository implements StatusRepositoryInterface
{
    public function getProjectStatuses(int $userId): array
    {
        return ProjectStatus::where('user_id', $userId)
            ->orderBy('order')
            ->get()
            ->toArray();
    }

    public function getTaskStatuses(int $userId): array
    {
        return TaskStatus::where('user_id', $userId)
            ->orderBy('order')
            ->get()
            ->toArray();
    }

    public function getTaskPriorities(int $userId): array
    {
        return TaskPriority::where('user_id', $userId)
            ->orderBy('level', 'desc')
            ->get()
            ->toArray();
    }

    public function findProjectStatus(int $id): ?array
    {
        /** @var ProjectStatus|null $status */
        $status = ProjectStatus::find($id);

        return $status?->toArray();
    }

    public function findTaskStatus(int $id): ?array
    {
        /** @var TaskStatus|null $status */
        $status = TaskStatus::find($id);

        return $status?->toArray();
    }

    public function findTaskPriority(int $id): ?array
    {
        /** @var TaskPriority|null $priority */
        $priority = TaskPriority::find($id);

        return $priority?->toArray();
    }

    public function createProjectStatus(array $data): array
    {
        return ProjectStatus::create($data)->toArray();
    }

    public function updateProjectStatus(int $id, array $data): ?array
    {
        /** @var ProjectStatus|null $status */
        $status = ProjectStatus::find($id);
        if ($status && !$status->is_system) {
            $status->update($data);
            return $status->fresh()->toArray();
        }
        return $status?->toArray();
    }

    public function deleteProjectStatus(int $id): bool
    {
        $status = ProjectStatus::find($id);
        if ($status && !$status->is_system) {
            return $status->delete();
        }
        return false;
    }

    public function createTaskStatus(array $data): array
    {
        return TaskStatus::create($data)->toArray();
    }

    public function updateTaskStatus(int $id, array $data): ?array
    {
        $status = TaskStatus::find($id);
        if ($status && !$status->is_system) {
            $status->update($data);
            return $status->fresh()->toArray();
        }
        return $status?->toArray();
    }

    public function deleteTaskStatus(int $id): bool
    {
        $status = TaskStatus::find($id);
        if ($status && !$status->is_system) {
            return $status->delete();
        }
        return false;
    }

    public function createTaskPriority(array $data): array
    {
        return TaskPriority::create($data)->toArray();
    }

    public function updateTaskPriority(int $id, array $data): ?array
    {
        $priority = TaskPriority::find($id);
        if ($priority && !$priority->is_system) {
            $priority->update($data);
            return $priority->fresh()->toArray();
        }
        return $priority?->toArray();
    }

    public function deleteTaskPriority(int $id): bool
    {
        $priority = TaskPriority::find($id);
        if ($priority && !$priority->is_system) {
            return $priority->delete();
        }
        return false;
    }

    /**
     * Create default statuses for a new user.
     */
    public function createDefaultsForUser(int $userId): void
    {
        // Default Project Statuses
        $projectStatuses = [
            ['slug' => 'active', 'name' => 'Active', 'color' => '#22c55e', 'order' => 0, 'is_system' => true],
            ['slug' => 'hold', 'name' => 'On Hold', 'color' => '#eab308', 'order' => 1, 'is_system' => true],
            ['slug' => 'archived', 'name' => 'Archived', 'color' => '#64748b', 'order' => 2, 'is_system' => true],
        ];

        foreach ($projectStatuses as $status) {
            ProjectStatus::create(array_merge($status, ['user_id' => $userId]));
        }

        // Default Task Statuses
        $taskStatuses = [
            ['slug' => 'todo', 'name' => 'To Do', 'color' => '#64748b', 'order' => 0, 'is_system' => true, 'is_completed' => false],
            ['slug' => 'in_progress', 'name' => 'In Progress', 'color' => '#3b82f6', 'order' => 1, 'is_system' => true, 'is_completed' => false],
            ['slug' => 'review', 'name' => 'Review', 'color' => '#8b5cf6', 'order' => 2, 'is_system' => true, 'is_completed' => false],
            ['slug' => 'done', 'name' => 'Done', 'color' => '#22c55e', 'order' => 3, 'is_system' => true, 'is_completed' => true],
        ];

        foreach ($taskStatuses as $status) {
            TaskStatus::create(array_merge($status, ['user_id' => $userId]));
        }

        // Default Task Priorities
        $taskPriorities = [
            ['slug' => 'low', 'name' => 'Low', 'color' => '#64748b', 'level' => 0, 'is_system' => true],
            ['slug' => 'medium', 'name' => 'Medium', 'color' => '#eab308', 'level' => 1, 'is_system' => true],
            ['slug' => 'high', 'name' => 'High', 'color' => '#f97316', 'level' => 2, 'is_system' => true],
            ['slug' => 'urgent', 'name' => 'Urgent', 'color' => '#ef4444', 'level' => 3, 'is_system' => true],
        ];

        foreach ($taskPriorities as $priority) {
            TaskPriority::create(array_merge($priority, ['user_id' => $userId]));
        }
    }
}
