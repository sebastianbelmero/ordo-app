<?php

declare(strict_types=1);

namespace App\Http\Controllers\Vocatio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vocatio\StoreJobRequest;
use App\Http\Requests\Vocatio\UpdateJobRequest;
use App\Models\User;
use App\Services\Vocatio\VocatioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * VOCATIO JOB CONTROLLER
 * ======================================================================================
 */
class JobController extends Controller
{
    public function __construct(
        protected VocatioService $vocatioService
    ) {}

    /**
     * Display all jobs for user (across pipelines).
     *
     * Route: GET /vocatio/jobs
     * View: Pages/Vocatio/Jobs/All.tsx
     */
    public function all(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Vocatio/Jobs/All', [
            'jobs' => $this->vocatioService->getAllJobsForUser($userId),
            'pipelines' => $this->vocatioService->getPipelines($userId),
            'statuses' => $this->vocatioService->getJobStatuses($userId),
        ]);
    }

    /**
     * Display jobs in a pipeline.
     *
     * Route: GET /vocatio/pipelines/{pipeline}/jobs
     * View: Pages/Vocatio/Jobs/Index.tsx
     */
    public function index(Request $request, int $pipeline): Response
    {
        $pipelineData = $this->vocatioService->getPipeline($pipeline);

        if (! $pipelineData) {
            abort(404);
        }

        return Inertia::render('Vocatio/Jobs/Index', [
            'pipeline' => $pipelineData,
            'jobs' => $this->vocatioService->getJobs($pipeline),
            'statuses' => $this->vocatioService->getJobStatuses($request->user()->id),
        ]);
    }

    /**
     * Show create job form.
     *
     * Route: GET /vocatio/pipelines/{pipeline}/jobs/create
     * View: Pages/Vocatio/Jobs/Create.tsx
     */
    public function create(Request $request, int $pipeline): Response
    {
        $pipelineData = $this->vocatioService->getPipeline($pipeline);

        if (! $pipelineData) {
            abort(404);
        }

        return Inertia::render('Vocatio/Jobs/Create', [
            'pipeline' => $pipelineData,
            'statuses' => $this->vocatioService->getJobStatuses($request->user()->id),
        ]);
    }

    /**
     * Store a new job.
     *
     * Route: POST /vocatio/pipelines/{pipeline}/jobs
     */
    public function store(StoreJobRequest $request, int $pipeline): RedirectResponse
    {
        $data = $request->validated();
        $data['pipeline_id'] = $pipeline;
        $data['user_id'] = $request->user()->id;

        $job = $this->vocatioService->createJob($data);

        return redirect()
            ->route('vocatio.jobs.show', $job['id'])
            ->with('success', 'Job application created successfully.');
    }

    /**
     * Display single job.
     *
     * Route: GET /vocatio/jobs/{job}
     * View: Pages/Vocatio/Jobs/Show.tsx
     */
    public function show(Request $request, string $job): Response
    {
        $user = $request->user();

        $data = $this->vocatioService->getJob($job);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Vocatio/Jobs/Show', [
            'job' => $data,
            'statuses' => $this->vocatioService->getJobStatuses($user->id),
            'friends' => $user->friends()->map(fn ($friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
            ]),
        ]);
    }

    /**
     * Show edit job form.
     *
     * Route: GET /vocatio/jobs/{job}/edit
     * View: Pages/Vocatio/Jobs/Edit.tsx
     */
    public function edit(Request $request, string $job): Response
    {
        $data = $this->vocatioService->getJob($job);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Vocatio/Jobs/Edit', [
            'job' => $data,
            'statuses' => $this->vocatioService->getJobStatuses($request->user()->id),
        ]);
    }

    /**
     * Update a job.
     *
     * Route: PUT /vocatio/jobs/{job}
     */
    public function update(UpdateJobRequest $request, string $job): RedirectResponse
    {
        $data = $this->vocatioService->updateJob($job, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('vocatio.jobs.show', $job)
            ->with('success', 'Job application updated successfully.');
    }

    /**
     * Update job status (for Kanban drag & drop).
     *
     * Route: PATCH /vocatio/jobs/{job}/status
     */
    public function updateStatus(Request $request, string $job): RedirectResponse
    {
        $request->validate([
            'status_id' => 'required|integer|exists:vocatio_job_statuses,id',
            'position' => 'nullable|integer|min:0',
        ]);

        $data = $this->vocatioService->updateJobStatus(
            $job,
            $request->input('status_id'),
            $request->input('position')
        );

        if (! $data) {
            abort(404);
        }

        return back()->with('success', 'Job status updated.');
    }

    /**
     * Delete a job.
     *
     * Route: DELETE /vocatio/jobs/{job}
     */
    public function destroy(string $job): RedirectResponse
    {
        $jobData = $this->vocatioService->getJob($job);

        if (! $jobData) {
            abort(404);
        }

        $pipelineId = $jobData['pipeline_id'];
        $this->vocatioService->deleteJob($job);

        return redirect()
            ->route('vocatio.pipelines.show', $pipelineId)
            ->with('success', 'Job application deleted successfully.');
    }
}
