<?php

declare(strict_types=1);

namespace App\Http\Controllers\Studium;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studium\StoreCourseRequest;
use App\Http\Requests\Studium\UpdateCourseRequest;
use App\Services\Studium\StudiumService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * STUDIUM COURSE CONTROLLER
 * ======================================================================================
 */
class CourseController extends Controller
{
    public function __construct(
        protected StudiumService $studiumService
    ) {}

    /**
     * Display courses in a semester.
     *
     * Route: GET /studium/semesters/{semester}/courses
     * View: Pages/Studium/Courses/Index.tsx
     */
    public function index(int $semester): Response
    {
        $semesterData = $this->studiumService->getSemester($semester);

        if (! $semesterData) {
            abort(404);
        }

        return Inertia::render('Studium/Courses/Index', [
            'semester' => $semesterData,
            'courses' => $this->studiumService->getCourses($semester),
        ]);
    }

    /**
     * Show create course form.
     *
     * Route: GET /studium/semesters/{semester}/courses/create
     * View: Pages/Studium/Courses/Create.tsx
     */
    public function create(int $semester): Response
    {
        $semesterData = $this->studiumService->getSemester($semester);

        if (! $semesterData) {
            abort(404);
        }

        return Inertia::render('Studium/Courses/Create', [
            'semester' => $semesterData,
        ]);
    }

    /**
     * Store a new course.
     *
     * Route: POST /studium/semesters/{semester}/courses
     */
    public function store(StoreCourseRequest $request, int $semester): RedirectResponse
    {
        $data = $request->validated();
        $data['semester_id'] = $semester;

        $course = $this->studiumService->createCourse($data);

        return redirect()
            ->route('studium.courses.show', $course['id'])
            ->with('success', 'Course created successfully.');
    }

    /**
     * Display single course with assignments.
     *
     * Route: GET /studium/courses/{course}
     * View: Pages/Studium/Courses/Show.tsx
     */
    public function show(int $course): Response
    {
        $data = $this->studiumService->getCourseWithAssignments($course);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Courses/Show', [
            'course' => $data,
        ]);
    }

    /**
     * Show edit course form.
     *
     * Route: GET /studium/courses/{course}/edit
     * View: Pages/Studium/Courses/Edit.tsx
     */
    public function edit(int $course): Response
    {
        $data = $this->studiumService->getCourse($course);

        if (! $data) {
            abort(404);
        }

        return Inertia::render('Studium/Courses/Edit', [
            'course' => $data,
        ]);
    }

    /**
     * Update a course.
     *
     * Route: PUT /studium/courses/{course}
     */
    public function update(UpdateCourseRequest $request, int $course): RedirectResponse
    {
        $data = $this->studiumService->updateCourse($course, $request->validated());

        if (! $data) {
            abort(404);
        }

        return redirect()
            ->route('studium.courses.show', $course)
            ->with('success', 'Course updated successfully.');
    }

    /**
     * Delete a course.
     *
     * Route: DELETE /studium/courses/{course}
     */
    public function destroy(int $course): RedirectResponse
    {
        $courseData = $this->studiumService->getCourse($course);

        if (! $courseData) {
            abort(404);
        }

        $semesterId = $courseData['semester_id'];
        $this->studiumService->deleteCourse($course);

        return redirect()
            ->route('studium.semesters.show', $semesterId)
            ->with('success', 'Course deleted successfully.');
    }
}
