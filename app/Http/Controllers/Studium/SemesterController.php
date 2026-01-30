<?php

declare(strict_types=1);

namespace App\Http\Controllers\Studium;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studium\StoreSemesterRequest;
use App\Http\Requests\Studium\UpdateSemesterRequest;
use App\Services\Studium\StudiumService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * STUDIUM SEMESTER CONTROLLER
 * ======================================================================================
 */
class SemesterController extends Controller
{
    public function __construct(
        protected StudiumService $studiumService
    ) {}

    /**
     * Display semesters in a program.
     *
     * Route: GET /studium/programs/{program}/semesters
     * View: Pages/Studium/Semesters/Index.tsx
     */
    public function index(int $program): Response
    {
        $programData = $this->studiumService->getProgram($program);

        if (! $programData) {
            abort(404);
        }

        return Inertia::render('Studium/Semesters/Index', [
            'program' => $programData,
            'semesters' => $this->studiumService->getSemesters($program),
        ]);
    }

    /**
     * Show create semester form.
     *
     * Route: GET /studium/programs/{program}/semesters/create
     * View: Pages/Studium/Semesters/Create.tsx
     */
    public function create(int $program): Response
    {
        $programData = $this->studiumService->getProgram($program);

        if (! $programData) {
            abort(404);
        }

        return Inertia::render('Studium/Semesters/Create', [
            'program' => $programData,
        ]);
    }

    /**
     * Store a new semester.
     *
     * Route: POST /studium/programs/{program}/semesters
     */
    public function store(StoreSemesterRequest $request, int $program): RedirectResponse
    {
        $data = $request->validated();
        $data['program_id'] = $program;

        $semester = $this->studiumService->createSemester($data);

        return redirect()
            ->route('studium.semesters.show', $semester['id'])
            ->with('success', 'Semester created successfully.');
    }

    /**
     * Display single semester with courses.
     *
     * Route: GET /studium/semesters/{semester}
     * View: Pages/Studium/Semesters/Show.tsx
     */
    public function show(int $semester): Response
    {
        $data = $this->studiumService->getSemesterWithCourses($semester);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Semesters/Show', [
            'semester' => $data,
        ]);
    }

    /**
     * Show edit semester form.
     *
     * Route: GET /studium/semesters/{semester}/edit
     * View: Pages/Studium/Semesters/Edit.tsx
     */
    public function edit(int $semester): Response
    {
        $data = $this->studiumService->getSemester($semester);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Semesters/Edit', [
            'semester' => $data,
        ]);
    }

    /**
     * Update a semester.
     *
     * Route: PUT /studium/semesters/{semester}
     */
    public function update(UpdateSemesterRequest $request, int $semester): RedirectResponse
    {
        $data = $this->studiumService->updateSemester($semester, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('studium.semesters.show', $semester)
            ->with('success', 'Semester updated successfully.');
    }

    /**
     * Delete a semester.
     *
     * Route: DELETE /studium/semesters/{semester}
     */
    public function destroy(int $semester): RedirectResponse
    {
        $semesterData = $this->studiumService->getSemester($semester);

        if (! $semesterData) {
            abort(404);
        }

        $programId = $semesterData['program_id'];
        $this->studiumService->deleteSemester($semester);

        return redirect()
            ->route('studium.programs.show', $programId)
            ->with('success', 'Semester deleted successfully.');
    }
}
