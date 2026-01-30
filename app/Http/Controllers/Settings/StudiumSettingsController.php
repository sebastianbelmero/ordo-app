<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Studium\StudiumService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * STUDIUM SETTINGS CONTROLLER
 * ======================================================================================
 *
 * Manages Studium module settings: Assignment Types.
 *
 * ======================================================================================
 */
class StudiumSettingsController extends Controller
{
    public function __construct(
        protected StudiumService $studiumService
    ) {}

    /**
     * Display the Studium settings page.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $types = $this->studiumService->getAssignmentTypes($userId);

        return Inertia::render('settings/studium', [
            'assignmentTypes' => $types['data'] ?? [],
        ]);
    }

    /**
     * Store a new assignment type.
     */
    public function storeAssignmentType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:50', 'alpha_dash'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['is_system'] = false;

        $this->studiumService->createAssignmentType($data);

        return back()->with('success', 'Assignment type created successfully.');
    }

    /**
     * Update an assignment type.
     */
    public function updateAssignmentType(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:7'],
            'order' => ['nullable', 'integer'],
        ]);

        $this->studiumService->updateAssignmentType($id, $data);

        return back()->with('success', 'Assignment type updated successfully.');
    }

    /**
     * Delete an assignment type.
     */
    public function destroyAssignmentType(int $id): RedirectResponse
    {
        $this->studiumService->deleteAssignmentType($id);

        return back()->with('success', 'Assignment type deleted successfully.');
    }
}
