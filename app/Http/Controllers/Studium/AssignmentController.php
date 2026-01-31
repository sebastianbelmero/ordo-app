<?php

declare(strict_types=1);

namespace App\Http\Controllers\Studium;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studium\StoreAssignmentRequest;
use App\Http\Requests\Studium\UpdateAssignmentRequest;
use App\Services\Studium\StudiumService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * STUDIUM ASSIGNMENT CONTROLLER
 * ======================================================================================
 */
class AssignmentController extends Controller
{
    public function __construct(
        protected StudiumService $studiumService
    ) {}

    /**
     * Display upcoming assignments (dashboard widget).
     *
     * Route: GET /studium/assignments/upcoming
     * View: Pages/Studium/Assignments/Upcoming.tsx
     */
    public function upcoming(Request $request): Response
    {
        $userId = $request->user()->id;

        return Inertia::render('Studium/Assignments/Upcoming', [
            'assignments' => $this->studiumService->getUpcomingAssignments($userId),
        ]);
    }

    /**
     * Display assignments in a course.
     *
     * Route: GET /studium/courses/{course}/assignments
     * View: Pages/Studium/Assignments/Index.tsx
     */
    public function index(Request $request, int $course): Response
    {
        $courseData = $this->studiumService->getCourse($course);

        if (! $courseData) {
            abort(404);
        }

        return Inertia::render('Studium/Assignments/Index', [
            'course' => $courseData,
            'assignments' => $this->studiumService->getAssignments($course),
            'types' => $this->studiumService->getAssignmentTypes($request->user()->id),
        ]);
    }

    /**
     * Show create assignment form.
     *
     * Route: GET /studium/courses/{course}/assignments/create
     * View: Pages/Studium/Assignments/Create.tsx
     */
    public function create(Request $request, int $course): Response
    {
        $courseData = $this->studiumService->getCourse($course);

        if (! $courseData) {
            abort(404);
        }

        return Inertia::render('Studium/Assignments/Create', [
            'course' => $courseData,
            'types' => $this->studiumService->getAssignmentTypes($request->user()->id),
        ]);
    }

    /**
     * Store a new assignment.
     *
     * Route: POST /studium/courses/{course}/assignments
     */
    public function store(StoreAssignmentRequest $request, int $course): RedirectResponse
    {
        $data = $request->validated();
        $data['course_id'] = $course;

        $assignment = $this->studiumService->createAssignment($data, $request->user());

        return redirect()
            ->route('studium.assignments.show', $assignment['id'])
            ->with('success', 'Assignment created successfully.');
    }

    /**
     * Display single assignment.
     *
     * Route: GET /studium/assignments/{assignment}
     * View: Pages/Studium/Assignments/Show.tsx
     */
    public function show(int $assignment): Response
    {
        $data = $this->studiumService->getAssignment($assignment);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Assignments/Show', [
            'assignment' => $data,
        ]);
    }

    /**
     * Show edit assignment form.
     *
     * Route: GET /studium/assignments/{assignment}/edit
     * View: Pages/Studium/Assignments/Edit.tsx
     */
    public function edit(Request $request, int $assignment): Response
    {
        $data = $this->studiumService->getAssignment($assignment);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Assignments/Edit', [
            'assignment' => $data,
            'types' => $this->studiumService->getAssignmentTypes($request->user()->id),
        ]);
    }

    /**
     * Update an assignment.
     *
     * Route: PUT /studium/assignments/{assignment}
     */
    public function update(UpdateAssignmentRequest $request, int $assignment): RedirectResponse
    {
        $data = $this->studiumService->updateAssignment($assignment, $request->validated(), $request->user());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('studium.assignments.show', $assignment)
            ->with('success', 'Assignment updated successfully.');
    }

    /**
     * Toggle assignment completion.
     *
     * Route: PATCH /studium/assignments/{assignment}/toggle-complete
     */
    public function toggleComplete(Request $request, int $assignment): RedirectResponse
    {
        $assignmentData = $this->studiumService->getAssignment($assignment);

        if (! $assignmentData) {
            abort(404);
        }

        // Toggle: if grade is null, set to 100 (completed), otherwise set to null (pending)
        $newGrade = $assignmentData['grade'] === null ? 100 : null;

        $this->studiumService->updateAssignment($assignment, [
            'grade' => $newGrade,
        ], $request->user());

        $status = $newGrade !== null ? 'completed' : 'pending';

        return back()->with('success', "Assignment marked as {$status}.");
    }

    /**
     * Delete an assignment.
     *
     * Route: DELETE /studium/assignments/{assignment}
     */
    public function destroy(Request $request, int $assignment): RedirectResponse
    {
        $assignmentData = $this->studiumService->getAssignment($assignment);

        if (! $assignmentData) {
            abort(404);
        }

        $courseId = $assignmentData['course_id'];
        $this->studiumService->deleteAssignment($assignment, $request->user());

        return redirect()
            ->route('studium.courses.show', $courseId)
            ->with('success', 'Assignment deleted successfully.');
    }
}
