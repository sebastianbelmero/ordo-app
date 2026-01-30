<?php

declare(strict_types=1);

namespace App\Http\Controllers\Opus;

use App\Http\Controllers\Controller;
use App\Http\Requests\Opus\StoreTaskRequest;
use App\Http\Requests\Opus\UpdateTaskRequest;
use App\Services\Opus\OpusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * OPUS TASK CONTROLLER
 * ======================================================================================
 */
class TaskController extends Controller
{
    public function __construct(
        protected OpusService $opusService
    ) {}

    /**
     * Display tasks in a project.
     *
     * Route: GET /opus/projects/{project}/tasks
     * View: Pages/Opus/Tasks/Index.tsx
     */
    public function index(Request $request, int $project): Response
    {
        $projectData = $this->opusService->getProject($project);

        if (! $projectData) {
            abort(404);
        }

        return Inertia::render('Opus/Tasks/Index', [
            'project' => $projectData,
            'tasks' => $this->opusService->getTasks($project),
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Show create task form.
     *
     * Route: GET /opus/projects/{project}/tasks/create
     * View: Pages/Opus/Tasks/Create.tsx
     */
    public function create(Request $request, int $project): Response
    {
        $projectData = $this->opusService->getProject($project);

        if (! $projectData) {
            abort(404);
        }

        return Inertia::render('Opus/Tasks/Create', [
            'project' => $projectData,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Store a new task.
     *
     * Route: POST /opus/projects/{project}/tasks
     */
    public function store(StoreTaskRequest $request, int $project): RedirectResponse
    {
        $data = $request->validated();
        $data['project_id'] = $project;

        $task = $this->opusService->createTask($data);

        return redirect()
            ->route('opus.tasks.show', $task['id'])
            ->with('success', 'Task created successfully.');
    }

    /**
     * Display single task.
     *
     * Route: GET /opus/tasks/{task}
     * View: Pages/Opus/Tasks/Show.tsx
     */
    public function show(Request $request, int $task): Response
    {
        $userId = $request->user()->id;

        $taskData = $this->opusService->getTask($task);

        if (! $taskData) {
            abort(404);
        }

        return Inertia::render('Opus/Tasks/Show', [
            'task' => $taskData,
            'statusConfig' => $this->opusService->getStatusConfig($userId),
        ]);
    }

    /**
     * Show edit task form.
     *
     * Route: GET /opus/tasks/{task}/edit
     * View: Pages/Opus/Tasks/Edit.tsx
     */
    public function edit(Request $request, int $task): Response
    {
        $taskData = $this->opusService->getTask($task);

        if (! $taskData) {
            abort(404);
        }

        return Inertia::render('Opus/Tasks/Edit', [
            'task' => $taskData,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Update a task.
     *
     * Route: PUT /opus/tasks/{task}
     */
    public function update(UpdateTaskRequest $request, int $task): RedirectResponse
    {
        $data = $this->opusService->updateTask($task, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('opus.tasks.show', $task)
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Update task status (for Kanban drag & drop).
     *
     * Route: PATCH /opus/tasks/{task}/status
     */
    public function updateStatus(Request $request, int $task): RedirectResponse
    {
        $request->validate([
            'status_id' => 'required|integer|exists:opus_task_statuses,id',
            'position' => 'nullable|integer|min:0',
        ]);

        $data = $this->opusService->updateTaskStatus(
            $task,
            $request->input('status_id'),
            $request->input('position')
        );

        if (! $data) {
            abort(404);
        }

        return back()->with('success', 'Task status updated.');
    }

    /**
     * Toggle task completion.
     *
     * Route: PATCH /opus/tasks/{task}/toggle-complete
     */
    public function toggleComplete(Request $request, int $task): RedirectResponse
    {
        $userId = $request->user()->id;
        $taskData = $this->opusService->getTask($task);

        if (! $taskData) {
            abort(404);
        }

        $statuses = $this->opusService->getTaskStatuses($userId);
        $currentStatus = $taskData['status'] ?? null;

        // Find a completed status or non-completed status to toggle to
        $isCurrentlyCompleted = $currentStatus && ($currentStatus['is_completed'] ?? false);

        if ($isCurrentlyCompleted) {
            // Find first non-completed status (usually "To Do")
            $targetStatus = collect($statuses)->firstWhere('is_completed', false);
        } else {
            // Find first completed status (usually "Done")
            $targetStatus = collect($statuses)->firstWhere('is_completed', true);
        }

        if ($targetStatus) {
            $this->opusService->updateTaskStatus($task, $targetStatus['id']);
            $status = $targetStatus['is_completed'] ? 'completed' : 'pending';
            return back()->with('success', "Task marked as {$status}.");
        }

        return back()->with('error', 'No suitable status found.');
    }

    /**
     * Delete a task.
     *
     * Route: DELETE /opus/tasks/{task}
     */
    public function destroy(int $task): RedirectResponse
    {
        $taskData = $this->opusService->getTask($task);

        if (! $taskData) {
            abort(404);
        }

        $projectId = $taskData['project_id'];
        $this->opusService->deleteTask($task);

        return redirect()
            ->route('opus.projects.show', $projectId)
            ->with('success', 'Task deleted successfully.');
    }
}
