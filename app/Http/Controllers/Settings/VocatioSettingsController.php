<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Vocatio\VocatioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * VOCATIO SETTINGS CONTROLLER
 * ======================================================================================
 *
 * Manages Vocatio module settings: Job Statuses.
 *
 * ======================================================================================
 */
class VocatioSettingsController extends Controller
{
    public function __construct(
        protected VocatioService $vocatioService
    ) {}

    /**
     * Display the Vocatio settings page.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $statuses = $this->vocatioService->getJobStatuses($userId);

        return Inertia::render('settings/vocatio', [
            'jobStatuses' => $statuses['data'] ?? [],
        ]);
    }

    /**
     * Store a new job status.
     */
    public function storeJobStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:50', 'alpha_dash'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
            'is_final' => ['nullable', 'boolean'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_system'] = false;
        $data['is_final'] = $data['is_final'] ?? false;

        $this->vocatioService->createJobStatus($data);

        return back()->with('success', 'Job status created successfully.');
    }

    /**
     * Update a job status.
     */
    public function updateJobStatus(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
            'is_final' => ['nullable', 'boolean'],
        ]);

        $this->vocatioService->updateJobStatusSettings($id, $data);

        return back()->with('success', 'Job status updated successfully.');
    }

    /**
     * Delete a job status.
     */
    public function destroyJobStatus(int $id): RedirectResponse
    {
        $this->vocatioService->deleteJobStatus($id);

        return back()->with('success', 'Job status deleted successfully.');
    }
}
