<?php

declare(strict_types=1);

namespace App\Http\Controllers\Studium;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studium\StoreProgramRequest;
use App\Http\Requests\Studium\UpdateProgramRequest;
use App\Services\Studium\StudiumService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * STUDIUM PROGRAM CONTROLLER
 * ======================================================================================
 */
class ProgramController extends Controller
{
    public function __construct(
        protected StudiumService $studiumService
    ) {}

    /**
     * Display a listing of programs.
     *
     * Route: GET /studium/programs
     * View: Pages/Studium/Programs/Index.tsx
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Studium/Programs/Index', [
            'programs' => $this->studiumService->getPrograms($userId),
        ]);
    }

    /**
     * Show create program form.
     *
     * Route: GET /studium/programs/create
     * View: Pages/Studium/Programs/Create.tsx
     */
    public function create(): Response
    {
        return Inertia::render('Studium/Programs/Create');
    }

    /**
     * Store a new program.
     *
     * Route: POST /studium/programs
     */
    public function store(StoreProgramRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $program = $this->studiumService->createProgram($data);

        return redirect()
            ->route('studium.programs.show', $program['id'])
            ->with('success', 'Program created successfully.');
    }

    /**
     * Display single program with semesters.
     *
     * Route: GET /studium/programs/{program}
     * View: Pages/Studium/Programs/Show.tsx
     */
    public function show(int $program): Response
    {
        $data = $this->studiumService->getProgramWithSemesters($program);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Programs/Show', [
            'program' => $data,
        ]);
    }

    /**
     * Display program with full hierarchy (for overview page).
     *
     * Route: GET /studium/programs/{program}/overview
     * View: Pages/Studium/Programs/Overview.tsx
     */
    public function overview(int $program): Response
    {
        $data = $this->studiumService->getProgramWithFullHierarchy($program);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Programs/Overview', [
            'program' => $data,
        ]);
    }

    /**
     * Show edit program form.
     *
     * Route: GET /studium/programs/{program}/edit
     * View: Pages/Studium/Programs/Edit.tsx
     */
    public function edit(int $program): Response
    {
        $data = $this->studiumService->getProgram($program);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Programs/Edit', [
            'program' => $data,
        ]);
    }

    /**
     * Update a program.
     *
     * Route: PUT /studium/programs/{program}
     */
    public function update(UpdateProgramRequest $request, int $program): RedirectResponse
    {
        $data = $this->studiumService->updateProgram($program, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('studium.programs.show', $program)
            ->with('success', 'Program updated successfully.');
    }

    /**
     * Delete a program.
     *
     * Route: DELETE /studium/programs/{program}
     */
    public function destroy(int $program): RedirectResponse
    {
        $deleted = $this->studiumService->deleteProgram($program);

        if (! $deleted) {
            abort(404);
        }

        return redirect()
            ->route('studium.programs.index')
            ->with('success', 'Program deleted successfully.');
    }
}
