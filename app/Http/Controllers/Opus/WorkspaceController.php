<?php

declare(strict_types=1);

namespace App\Http\Controllers\Opus;

use App\Http\Controllers\Controller;
use App\Http\Requests\Opus\StoreWorkspaceRequest;
use App\Http\Requests\Opus\UpdateWorkspaceRequest;
use App\Services\Opus\OpusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * OPUS WORKSPACE CONTROLLER
 * ======================================================================================
 *
 * Controller untuk menangani HTTP request terkait Opus Workspaces.
 *
 * ARSITEKTUR:
 * -----------
 * Request -> Controller -> Service -> Repository -> Data
 *                ↓
 *           Inertia Response
 *
 * Controller hanya bertanggung jawab:
 * 1. Menerima HTTP request
 * 2. Memanggil Service
 * 3. Return Inertia response
 *
 * ======================================================================================
 */
class WorkspaceController extends Controller
{
    public function __construct(
        protected OpusService $opusService
    ) {}

    /**
     * Display a listing of workspaces.
     *
     * Route: GET /opus/workspaces
     * View: Pages/Opus/Workspaces/Index.tsx
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Opus/Workspaces/Index', [
            'workspaces' => $this->opusService->getWorkspaces($userId),
            'statusConfig' => $this->opusService->getStatusConfig($userId),
        ]);
    }

    /**
     * Show create workspace form.
     *
     * Route: GET /opus/workspaces/create
     * View: Pages/Opus/Workspaces/Create.tsx
     */
    public function create(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Opus/Workspaces/Create', [
            'statusConfig' => $this->opusService->getStatusConfig($userId),
        ]);
    }

    /**
     * Store a new workspace.
     *
     * Route: POST /opus/workspaces
     */
    public function store(StoreWorkspaceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $workspace = $this->opusService->createWorkspace($data);

        return redirect()
            ->route('opus.workspaces.show', $workspace['id'])
            ->with('success', 'Workspace created successfully.');
    }

    /**
     * Display single workspace with projects.
     *
     * Route: GET /opus/workspaces/{workspace}
     * View: Pages/Opus/Workspaces/Show.tsx
     */
    public function show(Request $request, int $workspace): Response
    {
        $data = $this->opusService->getWorkspaceWithProjects($workspace);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Opus/Workspaces/Show', [
            'workspace' => $data,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Show edit workspace form.
     *
     * Route: GET /opus/workspaces/{workspace}/edit
     * View: Pages/Opus/Workspaces/Edit.tsx
     */
    public function edit(Request $request, int $workspace): Response
    {
        $data = $this->opusService->getWorkspace($workspace);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Opus/Workspaces/Edit', [
            'workspace' => $data,
            'statusConfig' => $this->opusService->getStatusConfig($request->user()->id),
        ]);
    }

    /**
     * Update a workspace.
     *
     * Route: PUT /opus/workspaces/{workspace}
     */
    public function update(UpdateWorkspaceRequest $request, int $workspace): RedirectResponse
    {
        $data = $this->opusService->updateWorkspace($workspace, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('opus.workspaces.show', $workspace)
            ->with('success', 'Workspace updated successfully.');
    }

    /**
     * Delete a workspace.
     *
     * Route: DELETE /opus/workspaces/{workspace}
     */
    public function destroy(int $workspace): RedirectResponse
    {
        $deleted = $this->opusService->deleteWorkspace($workspace);

        if (! $deleted) {
            abort(404);
        }

        return redirect()
            ->route('opus.workspaces.index')
            ->with('success', 'Workspace deleted successfully.');
    }
}
