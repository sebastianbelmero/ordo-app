<?php

declare(strict_types=1);

namespace App\Http\Controllers\Vocatio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vocatio\StorePipelineRequest;
use App\Http\Requests\Vocatio\UpdatePipelineRequest;
use App\Services\Vocatio\VocatioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * VOCATIO PIPELINE CONTROLLER
 * ======================================================================================
 */
class PipelineController extends Controller
{
    public function __construct(
        protected VocatioService $vocatioService
    ) {}

    /**
     * Display a listing of pipelines.
     *
     * Route: GET /vocatio/pipelines
     * View: Pages/Vocatio/Pipelines/Index.tsx
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Vocatio/Pipelines/Index', [
            'pipelines' => $this->vocatioService->getPipelines($userId),
        ]);
    }

    /**
     * Show create pipeline form.
     *
     * Route: GET /vocatio/pipelines/create
     * View: Pages/Vocatio/Pipelines/Create.tsx
     */
    public function create(): Response
    {
        return Inertia::render('Vocatio/Pipelines/Create');
    }

    /**
     * Store a new pipeline.
     *
     * Route: POST /vocatio/pipelines
     */
    public function store(StorePipelineRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $pipeline = $this->vocatioService->createPipeline($data);

        return redirect()
            ->route('vocatio.pipelines.show', $pipeline['id'])
            ->with('success', 'Pipeline created successfully.');
    }

    /**
     * Display single pipeline with jobs.
     *
     * Route: GET /vocatio/pipelines/{pipeline}
     * View: Pages/Vocatio/Pipelines/Show.tsx
     */
    public function show(Request $request, int $pipeline): Response
    {
        $data = $this->vocatioService->getPipelineWithJobs($pipeline);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Vocatio/Pipelines/Show', [
            'pipeline' => $data,
            'statuses' => $this->vocatioService->getJobStatuses($request->user()->id),
        ]);
    }

    /**
     * Display Kanban board for a pipeline.
     *
     * Route: GET /vocatio/pipelines/{pipeline}/board
     * View: Pages/Vocatio/Pipelines/Board.tsx
     */
    public function board(Request $request, int $pipeline): Response
    {
        $userId = $request->user()->id;

        $pipelineData = $this->vocatioService->getPipeline($pipeline);

        if (! $pipelineData) {
            abort(404);
        }

        return Inertia::render('Vocatio/Pipelines/Board', [
            'pipeline' => $pipelineData,
            'board' => $this->vocatioService->getKanbanBoard($pipeline, $userId),
            'statuses' => $this->vocatioService->getJobStatuses($userId),
        ]);
    }

    /**
     * Show edit pipeline form.
     *
     * Route: GET /vocatio/pipelines/{pipeline}/edit
     * View: Pages/Vocatio/Pipelines/Edit.tsx
     */
    public function edit(int $pipeline): Response
    {
        $data = $this->vocatioService->getPipeline($pipeline);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Vocatio/Pipelines/Edit', [
            'pipeline' => $data,
        ]);
    }

    /**
     * Update a pipeline.
     *
     * Route: PUT /vocatio/pipelines/{pipeline}
     */
    public function update(UpdatePipelineRequest $request, int $pipeline): RedirectResponse
    {
        $data = $this->vocatioService->updatePipeline($pipeline, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('vocatio.pipelines.show', $pipeline)
            ->with('success', 'Pipeline updated successfully.');
    }

    /**
     * Delete a pipeline.
     *
     * Route: DELETE /vocatio/pipelines/{pipeline}
     */
    public function destroy(int $pipeline): RedirectResponse
    {
        $deleted = $this->vocatioService->deletePipeline($pipeline);

        if (! $deleted) {
            abort(404);
        }

        return redirect()
            ->route('vocatio.pipelines.index')
            ->with('success', 'Pipeline deleted successfully.');
    }
}
