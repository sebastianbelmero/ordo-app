<?php

declare(strict_types=1);

namespace App\Http\Controllers\Opus;

use App\Http\Controllers\Controller;
use App\Http\Requests\Opus\StoreProjectRequest;
use App\Http\Requests\Opus\UpdateProjectRequest;
use App\Services\Opus\OpusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * OPUS PROJECT CONTROLLER
 * ======================================================================================
 */
class ProjectController extends Controller
{
    public function __construct(
        protected OpusService $opusService
    ) {}

    /**
     * Display projects in a workspace.
     *
     * Route: GET /opus/workspaces/{workspace}/projects
     * View: Pages/Opus/Projects/Index.tsx
     */
    public function index(Request $request, int $workspace): Response
    {
        return Inertia::render('Opus/Projects/Index', [
            'workspace' => $this->opusService->getWorkspace($workspace),
            'projects' => $this->opusService->getProjects($workspace),
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Show create project form.
     *
     * Route: GET /opus/workspaces/{workspace}/projects/create
     * View: Pages/Opus/Projects/Create.tsx
     */
    public function create(Request $request, int $workspace): Response
    {
        $workspaceData = $this->opusService->getWorkspace($workspace);

        if (! $workspaceData) {
            abort(404);
        }

        return Inertia::render('Opus/Projects/Create', [
            'workspace' => $workspaceData,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Store a new project.
     *
     * Route: POST /opus/workspaces/{workspace}/projects
     */
    public function store(StoreProjectRequest $request, int $workspace): RedirectResponse
    {
        $data = $request->validated();
        $data['workspace_id'] = $workspace;

        $project = $this->opusService->createProject($data);

        return redirect()
            ->route('opus.projects.show', $project['id'])
            ->with('success', 'Project created successfully.');
    }

    /**
     * Display single project with tasks.
     *
     * Route: GET /opus/projects/{project}
     * View: Pages/Opus/Projects/Show.tsx
     */
    public function show(Request $request, int $project): Response
    {
        $userId = $request->user()->id;

        $projectData = $this->opusService->getProjectWithTasks($project);

        if (! $projectData) {
            abort(404);
        }

        return Inertia::render('Opus/Projects/Show', [
            'project' => $projectData,
            'statusConfig' => $this->opusService->getStatusConfig($userId),
        ]);
    }

    /**
     * Display Kanban board for a project.
     *
     * Route: GET /opus/projects/{project}/board
     * View: Pages/Opus/Projects/Board.tsx
     */
    public function board(Request $request, int $project): Response
    {
        $userId = $request->user()->id;

        $projectData = $this->opusService->getProject($project);

        if (! $projectData) {
            abort(404);
        }

        return Inertia::render('Opus/Projects/Board', [
            'project' => $projectData,
            'board' => $this->opusService->getKanbanBoard($project, $userId),
            'statusConfig' => $this->opusService->getStatusConfig($userId),
        ]);
    }

    /**
     * Show edit project form.
     *
     * Route: GET /opus/projects/{project}/edit
     * View: Pages/Opus/Projects/Edit.tsx
     */
    public function edit(Request $request, int $project): Response
    {
        $projectData = $this->opusService->getProject($project);

        if (! $projectData) {
            abort(404);
        }

        return Inertia::render('Opus/Projects/Edit', [
            'project' => $projectData,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Update a project.
     *
     * Route: PUT /opus/projects/{project}
     */
    public function update(UpdateProjectRequest $request, int $project): RedirectResponse
    {
        $data = $this->opusService->updateProject($project, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('opus.projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Delete a project.
     *
     * Route: DELETE /opus/projects/{project}
     */
    public function destroy(int $project): RedirectResponse
    {
        $projectData = $this->opusService->getProject($project);

        if (! $projectData) {
            abort(404);
        }

        $workspaceId = $projectData['workspace_id'];
        $this->opusService->deleteProject($project);

        return redirect()
            ->route('opus.workspaces.show', $workspaceId)
            ->with('success', 'Project deleted successfully.');
    }
}
