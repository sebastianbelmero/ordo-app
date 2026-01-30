<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Opus\OpusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * OPUS SETTINGS CONTROLLER
 * ======================================================================================
 *
 * Manages Opus module settings: Project Statuses, Task Statuses, Task Priorities.
 *
 * ======================================================================================
 */
class OpusSettingsController extends Controller
{
    public function __construct(
        protected OpusService $opusService
    ) {}

    /**
     * Display the Opus settings page.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $statusConfig = $this->opusService->getStatusConfig($userId);

        return Inertia::render('settings/opus', [
            'projectStatuses' => $statusConfig['project_statuses'],
            'taskStatuses' => $statusConfig['task_statuses'],
            'taskPriorities' => $statusConfig['task_priorities'],
        ]);
    }

    /**
     * Store a new project status.
     */
    public function storeProjectStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:50', 'alpha_dash'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_system'] = false;

        $this->opusService->createProjectStatus($data);

        return back()->with('success', 'Project status created successfully.');
    }

    /**
     * Update a project status.
     */
    public function updateProjectStatus(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
        ]);

        $this->opusService->updateProjectStatus($id, $data);

        return back()->with('success', 'Project status updated successfully.');
    }

    /**
     * Delete a project status.
     */
    public function destroyProjectStatus(int $id): RedirectResponse
    {
        $this->opusService->deleteProjectStatus($id);

        return back()->with('success', 'Project status deleted successfully.');
    }

    /**
     * Store a new task status.
     */
    public function storeTaskStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:50', 'alpha_dash'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
            'is_completed' => ['nullable', 'boolean'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_system'] = false;
        $data['is_completed'] = $data['is_completed'] ?? false;

        $this->opusService->createTaskStatus($data);

        return back()->with('success', 'Task status created successfully.');
    }

    /**
     * Update a task status.
     */
    public function updateTaskStatus(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
            'is_completed' => ['nullable', 'boolean'],
        ]);

        $this->opusService->updateTaskStatusSettings($id, $data);

        return back()->with('success', 'Task status updated successfully.');
    }

    /**
     * Delete a task status.
     */
    public function destroyTaskStatus(int $id): RedirectResponse
    {
        $this->opusService->deleteTaskStatus($id);

        return back()->with('success', 'Task status deleted successfully.');
    }

    /**
     * Store a new task priority.
     */
    public function storeTaskPriority(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:50', 'alpha_dash'],
            'color' => ['required', 'string', 'max:7'],
            'level' => ['nullable', 'integer'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_system'] = false;

        $this->opusService->createTaskPriority($data);

        return back()->with('success', 'Task priority created successfully.');
    }

    /**
     * Update a task priority.
     */
    public function updateTaskPriority(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:7'],
            'level' => ['nullable', 'integer'],
        ]);

        $this->opusService->updateTaskPriority($id, $data);

        return back()->with('success', 'Task priority updated successfully.');
    }

    /**
     * Delete a task priority.
     */
    public function destroyTaskPriority(int $id): RedirectResponse
    {
        $this->opusService->deleteTaskPriority($id);

        return back()->with('success', 'Task priority deleted successfully.');
    }
}
