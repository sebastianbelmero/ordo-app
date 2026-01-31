<?php

declare(strict_types=1);

namespace App\Services\Opus;

use App\Contracts\Repositories\Opus\ProjectRepositoryInterface;
use App\Contracts\Repositories\Opus\StatusRepositoryInterface;
use App\Contracts\Repositories\Opus\TaskRepositoryInterface;
use App\Contracts\Repositories\Opus\WorkspaceRepositoryInterface;
use App\Models\User;
use App\Services\Google\GoogleCalendarService;

/**
 * ======================================================================================
 * OPUS SERVICE
 * ======================================================================================
 *
 * Service untuk modul Opus (Project & Task Management).
 * Menggabungkan semua repository Opus untuk kemudahan akses.
 *
 * ======================================================================================
 */
class OpusService
{
    public function __construct(
        protected WorkspaceRepositoryInterface $workspaceRepository,
        protected ProjectRepositoryInterface $projectRepository,
        protected TaskRepositoryInterface $taskRepository,
        protected StatusRepositoryInterface $statusRepository,
        protected GoogleCalendarService $googleCalendarService,
    ) {}

    // ==================================================================================
    // WORKSPACES
    // ==================================================================================

    /**
     * Get all workspaces for a user.
     */
    public function getWorkspaces(int $userId): array
    {
        return [
            'data' => $this->workspaceRepository->allForUser($userId),
        ];
    }

    /**
     * Get single workspace.
     */
    public function getWorkspace(int $id): ?array
    {
        return $this->workspaceRepository->find($id);
    }

    /**
     * Get workspace with projects.
     */
    public function getWorkspaceWithProjects(int $id): ?array
    {
        return $this->workspaceRepository->findWithProjects($id);
    }

    /**
     * Get workspace with full data (projects + tasks).
     */
    public function getWorkspaceWithProjectsAndTasks(int $id): ?array
    {
        return $this->workspaceRepository->findWithProjectsAndTasks($id);
    }

    // ==================================================================================
    // PROJECTS
    // ==================================================================================

    /**
     * Get all projects in a workspace.
     */
    public function getProjects(int $workspaceId): array
    {
        return [
            'data' => $this->projectRepository->allForWorkspace($workspaceId),
        ];
    }

    /**
     * Get single project.
     */
    public function getProject(int $id): ?array
    {
        return $this->projectRepository->findWithStatus($id);
    }

    /**
     * Get project with tasks.
     */
    public function getProjectWithTasks(int $id): ?array
    {
        return $this->projectRepository->findWithTasks($id);
    }

    // ==================================================================================
    // TASKS
    // ==================================================================================

    /**
     * Get all tasks in a project.
     */
    public function getTasks(int $projectId): array
    {
        return [
            'data' => $this->taskRepository->allForProject($projectId),
        ];
    }

    /**
     * Get single task.
     */
    public function getTask(int $id): ?array
    {
        return $this->taskRepository->findWithRelations($id);
    }

    /**
     * Get Kanban board data for a project.
     * Returns tasks grouped by status columns.
     */
    public function getKanbanBoard(int $projectId, int $userId): array
    {
        return [
            'data' => $this->taskRepository->getKanbanBoard($projectId, $userId),
        ];
    }

    // ==================================================================================
    // STATUSES & PRIORITIES
    // ==================================================================================

    /**
     * Get all status configurations for a user.
     * Useful for settings page or dropdowns.
     */
    public function getStatusConfig(int $userId): array
    {
        return [
            'project_statuses' => $this->statusRepository->getProjectStatuses($userId),
            'task_statuses' => $this->statusRepository->getTaskStatuses($userId),
            'task_priorities' => $this->statusRepository->getTaskPriorities($userId),
        ];
    }

    /**
     * Get task statuses for a user.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getTaskStatuses(int $userId): array
    {
        return $this->statusRepository->getTaskStatuses($userId);
    }

    // ==================================================================================
    // PROJECT STATUS CRUD
    // ==================================================================================

    public function createProjectStatus(array $data): array
    {
        return $this->statusRepository->createProjectStatus($data);
    }

    public function updateProjectStatus(int $id, array $data): ?array
    {
        return $this->statusRepository->updateProjectStatus($id, $data);
    }

    public function deleteProjectStatus(int $id): bool
    {
        return $this->statusRepository->deleteProjectStatus($id);
    }

    // ==================================================================================
    // TASK STATUS CRUD
    // ==================================================================================

    public function createTaskStatus(array $data): array
    {
        return $this->statusRepository->createTaskStatus($data);
    }

    public function updateTaskStatusSettings(int $id, array $data): ?array
    {
        return $this->statusRepository->updateTaskStatus($id, $data);
    }

    public function deleteTaskStatus(int $id): bool
    {
        return $this->statusRepository->deleteTaskStatus($id);
    }

    // ==================================================================================
    // TASK PRIORITY CRUD
    // ==================================================================================

    public function createTaskPriority(array $data): array
    {
        return $this->statusRepository->createTaskPriority($data);
    }

    public function updateTaskPriority(int $id, array $data): ?array
    {
        return $this->statusRepository->updateTaskPriority($id, $data);
    }

    public function deleteTaskPriority(int $id): bool
    {
        return $this->statusRepository->deleteTaskPriority($id);
    }

    // ==================================================================================
    // WORKSPACE CRUD
    // ==================================================================================

    /**
     * Create a new workspace.
     */
    public function createWorkspace(array $data): array
    {
        return $this->workspaceRepository->create($data);
    }

    /**
     * Update a workspace.
     */
    public function updateWorkspace(int $id, array $data): ?array
    {
        return $this->workspaceRepository->update($id, $data);
    }

    /**
     * Delete a workspace.
     */
    public function deleteWorkspace(int $id): bool
    {
        return $this->workspaceRepository->delete($id);
    }

    // ==================================================================================
    // PROJECT CRUD
    // ==================================================================================

    /**
     * Create a new project.
     */
    public function createProject(array $data): array
    {
        return $this->projectRepository->create($data);
    }

    /**
     * Update a project.
     */
    public function updateProject(int $id, array $data): ?array
    {
        return $this->projectRepository->update($id, $data);
    }

    /**
     * Delete a project.
     */
    public function deleteProject(int $id): bool
    {
        return $this->projectRepository->delete($id);
    }

    // ==================================================================================
    // TASK CRUD
    // ==================================================================================

    /**
     * Create a new task.
     */
    public function createTask(array $data, ?User $user = null): array
    {
        $task = $this->taskRepository->create($data);

        // Sync to Google Calendar if user is provided and has due_date
        if ($user && ! empty($task['due_date'])) {
            $eventId = $this->googleCalendarService->syncTask($user, $task);
            if ($eventId) {
                $this->taskRepository->update($task['id'], [
                    'google_calendar_event_id' => $eventId,
                ]);
                $task['google_calendar_event_id'] = $eventId;
            }
        }

        return $task;
    }

    /**
     * Update a task.
     */
    public function updateTask(int $id, array $data, ?User $user = null): ?array
    {
        $task = $this->taskRepository->update($id, $data);

        // Sync to Google Calendar if user is provided
        if ($task && $user && ! empty($task['due_date'])) {
            $eventId = $this->googleCalendarService->syncTask(
                $user,
                $task,
                $task['google_calendar_event_id'] ?? null
            );
            if ($eventId && $eventId !== ($task['google_calendar_event_id'] ?? null)) {
                $this->taskRepository->update($id, [
                    'google_calendar_event_id' => $eventId,
                ]);
                $task['google_calendar_event_id'] = $eventId;
            }
        }

        return $task;
    }

    /**
     * Update task status (for Kanban drag & drop).
     */
    public function updateTaskStatus(int $id, int $statusId, ?int $position = null): ?array
    {
        return $this->taskRepository->updateStatus($id, $statusId, $position);
    }

    /**
     * Delete a task.
     */
    public function deleteTask(int $id, ?User $user = null): bool
    {
        // Get task first to remove from Google Calendar
        $task = $this->taskRepository->findWithRelations($id);

        if ($task && $user && ! empty($task['google_calendar_event_id'])) {
            $this->googleCalendarService->removeEvent($user, $task['google_calendar_event_id']);
        }

        return $this->taskRepository->delete($id);
    }

    // ==================================================================================
    // STATUS INITIALIZATION
    // ==================================================================================

    /**
     * Initialize default statuses for a new user.
     */
    public function initializeStatusesForUser(int $userId): void
    {
        $this->statusRepository->createDefaultsForUser($userId);
    }
}
