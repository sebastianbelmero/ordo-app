<?php

declare(strict_types=1);

namespace App\Http\Controllers\Vocatio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vocatio\StoreJobShareRequest;
use App\Services\Vocatio\VocatioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * VOCATIO JOB SHARE CONTROLLER
 * ======================================================================================
 */
class JobShareController extends Controller
{
    public function __construct(
        protected VocatioService $vocatioService
    ) {}

    /**
     * Display shares (sent and received).
     *
     * Route: GET /vocatio/shares
     * View: Pages/Vocatio/Shares/Index.tsx
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Vocatio/Shares/Index', [
            'sent' => $this->vocatioService->getSentShares($userId),
            'received' => $this->vocatioService->getReceivedShares($userId),
            'pending' => $this->vocatioService->getPendingShares($userId),
        ]);
    }

    /**
     * Show create share form.
     *
     * Route: GET /vocatio/shares/create
     * View: Pages/Vocatio/Shares/Create.tsx
     */
    public function create(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Vocatio/Shares/Create', [
            'jobs' => $this->vocatioService->getAllJobsForUser($userId),
            'jobId' => $request->query('job_id'),
        ]);
    }

    /**
     * Store a new share.
     *
     * Route: POST /vocatio/shares
     */
    public function store(StoreJobShareRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sender_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $share = $this->vocatioService->createShare($data);

        return redirect()
            ->route('vocatio.shares.index')
            ->with('success', 'Job shared successfully.');
    }

    /**
     * Display single share.
     *
     * Route: GET /vocatio/shares/{share}
     * View: Pages/Vocatio/Shares/Show.tsx
     */
    public function show(Request $request, string $share): Response
    {
        $data = $this->vocatioService->getShare($share);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Vocatio/Shares/Show', [
            'share' => $data,
            'currentUserId' => $request->user()->id,
        ]);
    }

    /**
     * Respond to a share (accept/reject).
     *
     * Route: PATCH /vocatio/shares/{share}/respond
     */
    public function respond(Request $request, string $share): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $data = $this->vocatioService->respondToShare(
            $share,
            $request->input('status'),
            $request->user()->id
        );

        if (! $data) {
            abort(404);
        }

        $message = $request->input('status') === 'accepted'
            ? 'Job accepted and added to your pipeline!'
            : 'Share declined.';

        return redirect()
            ->route('vocatio.shares.index')
            ->with('success', $message);
    }

    /**
     * Delete a share.
     *
     * Route: DELETE /vocatio/shares/{share}
     */
    public function destroy(string $share): RedirectResponse
    {
        $deleted = $this->vocatioService->deleteShare($share);

        if (! $deleted) {
            abort(404);
        }

        return redirect()
            ->route('vocatio.shares.index')
            ->with('success', 'Share deleted successfully.');
    }
}
