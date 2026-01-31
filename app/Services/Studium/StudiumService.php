<?php

declare(strict_types=1);

namespace App\Services\Studium;

use App\Contracts\Repositories\Studium\AssignmentRepositoryInterface;
use App\Contracts\Repositories\Studium\CourseRepositoryInterface;
use App\Contracts\Repositories\Studium\ProgramRepositoryInterface;
use App\Contracts\Repositories\Studium\SemesterRepositoryInterface;
use App\Models\User;
use App\Services\Google\GoogleCalendarService;

/**
 * ======================================================================================
 * STUDIUM SERVICE
 * ======================================================================================
 *
 * Service untuk modul Studium (Academic Management).
 *
 * ======================================================================================
 */
class StudiumService
{
    public function __construct(
        protected ProgramRepositoryInterface $programRepository,
        protected SemesterRepositoryInterface $semesterRepository,
        protected CourseRepositoryInterface $courseRepository,
        protected AssignmentRepositoryInterface $assignmentRepository,
        protected GoogleCalendarService $googleCalendarService,
    ) {}

    // ==================================================================================
    // PROGRAMS
    // ==================================================================================

    /**
     * Get all programs for a user.
     */
    public function getPrograms(int $userId): array
    {
        return [
            'data' => $this->programRepository->allForUser($userId),
        ];
    }

    /**
     * Get single program.
     */
    public function getProgram(int $id): ?array
    {
        return $this->programRepository->find($id);
    }

    /**
     * Get program with semesters.
     */
    public function getProgramWithSemesters(int $id): ?array
    {
        return $this->programRepository->findWithSemesters($id);
    }

    /**
     * Get program with full hierarchy (semesters > courses > assignments).
     */
    public function getProgramWithFullHierarchy(int $id): ?array
    {
        return $this->programRepository->findWithFullHierarchy($id);
    }

    // ==================================================================================
    // SEMESTERS
    // ==================================================================================

    /**
     * Get all semesters for a program.
     */
    public function getSemesters(int $programId): array
    {
        return [
            'data' => $this->semesterRepository->allForProgram($programId),
        ];
    }

    /**
     * Get single semester.
     */
    public function getSemester(int $id): ?array
    {
        return $this->semesterRepository->find($id);
    }

    /**
     * Get active semester for a program.
     */
    public function getActiveSemester(int $programId): ?array
    {
        return $this->semesterRepository->findActive($programId);
    }

    /**
     * Get semester with courses.
     */
    public function getSemesterWithCourses(int $id): ?array
    {
        return $this->semesterRepository->findWithCourses($id);
    }

    // ==================================================================================
    // COURSES
    // ==================================================================================

    /**
     * Get all courses for a semester.
     */
    public function getCourses(int $semesterId): array
    {
        return [
            'data' => $this->courseRepository->allForSemester($semesterId),
        ];
    }

    /**
     * Get single course.
     */
    public function getCourse(int $id): ?array
    {
        return $this->courseRepository->find($id);
    }

    /**
     * Get course with assignments.
     */
    public function getCourseWithAssignments(int $id): ?array
    {
        return $this->courseRepository->findWithAssignments($id);
    }

    // ==================================================================================
    // ASSIGNMENTS
    // ==================================================================================

    /**
     * Get all assignments for a course.
     */
    public function getAssignments(int $courseId): array
    {
        return [
            'data' => $this->assignmentRepository->allForCourse($courseId),
        ];
    }

    /**
     * Get single assignment.
     */
    public function getAssignment(int $id): ?array
    {
        return $this->assignmentRepository->findWithType($id);
    }

    /**
     * Get upcoming assignments for dashboard widget.
     */
    public function getUpcomingAssignments(int $userId, int $limit = 10): array
    {
        return [
            'data' => $this->assignmentRepository->getUpcoming($userId, $limit),
        ];
    }

    /**
     * Get assignment types for user.
     */
    public function getAssignmentTypes(int $userId): array
    {
        return [
            'data' => $this->assignmentRepository->getTypes($userId),
        ];
    }

    /**
     * Create an assignment type.
     */
    public function createAssignmentType(array $data): array
    {
        return $this->assignmentRepository->createType($data);
    }

    /**
     * Update an assignment type.
     */
    public function updateAssignmentType(int $id, array $data): ?array
    {
        return $this->assignmentRepository->updateType($id, $data);
    }

    /**
     * Delete an assignment type.
     */
    public function deleteAssignmentType(int $id): bool
    {
        return $this->assignmentRepository->deleteType($id);
    }

    // ==================================================================================
    // PROGRAM CRUD
    // ==================================================================================

    /**
     * Create a new program.
     */
    public function createProgram(array $data): array
    {
        return $this->programRepository->create($data);
    }

    /**
     * Update a program.
     */
    public function updateProgram(int $id, array $data): ?array
    {
        return $this->programRepository->update($id, $data);
    }

    /**
     * Delete a program.
     */
    public function deleteProgram(int $id): bool
    {
        return $this->programRepository->delete($id);
    }

    // ==================================================================================
    // SEMESTER CRUD
    // ==================================================================================

    /**
     * Create a new semester.
     */
    public function createSemester(array $data): array
    {
        return $this->semesterRepository->create($data);
    }

    /**
     * Update a semester.
     */
    public function updateSemester(int $id, array $data): ?array
    {
        return $this->semesterRepository->update($id, $data);
    }

    /**
     * Delete a semester.
     */
    public function deleteSemester(int $id): bool
    {
        return $this->semesterRepository->delete($id);
    }

    // ==================================================================================
    // COURSE CRUD
    // ==================================================================================

    /**
     * Create a new course.
     */
    public function createCourse(array $data): array
    {
        return $this->courseRepository->create($data);
    }

    /**
     * Update a course.
     */
    public function updateCourse(int $id, array $data): ?array
    {
        return $this->courseRepository->update($id, $data);
    }

    /**
     * Delete a course.
     */
    public function deleteCourse(int $id): bool
    {
        return $this->courseRepository->delete($id);
    }

    // ==================================================================================
    // ASSIGNMENT CRUD
    // ==================================================================================

    /**
     * Create a new assignment.
     */
    public function createAssignment(array $data, ?User $user = null): array
    {
        $assignment = $this->assignmentRepository->create($data);

        // Sync to Google Calendar if user is provided and has deadline
        if ($user && ! empty($assignment['deadline'])) {
            $eventId = $this->googleCalendarService->syncAssignment($user, $assignment);
            if ($eventId) {
                $this->assignmentRepository->update($assignment['id'], [
                    'google_calendar_event_id' => $eventId,
                ]);
                $assignment['google_calendar_event_id'] = $eventId;
            }
        }

        return $assignment;
    }

    /**
     * Update an assignment.
     */
    public function updateAssignment(int $id, array $data, ?User $user = null): ?array
    {
        $assignment = $this->assignmentRepository->update($id, $data);

        // Sync to Google Calendar if user is provided
        if ($assignment && $user && ! empty($assignment['deadline'])) {
            $eventId = $this->googleCalendarService->syncAssignment(
                $user,
                $assignment,
                $assignment['google_calendar_event_id'] ?? null
            );
            if ($eventId && $eventId !== ($assignment['google_calendar_event_id'] ?? null)) {
                $this->assignmentRepository->update($id, [
                    'google_calendar_event_id' => $eventId,
                ]);
                $assignment['google_calendar_event_id'] = $eventId;
            }
        }

        return $assignment;
    }

    /**
     * Delete an assignment.
     */
    public function deleteAssignment(int $id, ?User $user = null): bool
    {
        // Get assignment first to remove from Google Calendar
        $assignment = $this->assignmentRepository->findWithType($id);

        if ($assignment && $user && ! empty($assignment['google_calendar_event_id'])) {
            $this->googleCalendarService->removeEvent($user, $assignment['google_calendar_event_id']);
        }

        return $this->assignmentRepository->delete($id);
    }

    // ==================================================================================
    // TYPE INITIALIZATION
    // ==================================================================================

    /**
     * Initialize default assignment types for a new user.
     */
    public function initializeTypesForUser(int $userId): void
    {
        $this->assignmentRepository->createDefaultTypesForUser($userId);
    }
}
