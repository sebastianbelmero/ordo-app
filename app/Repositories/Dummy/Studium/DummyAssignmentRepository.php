<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Studium;

use App\Contracts\Repositories\Studium\AssignmentRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY STUDIUM ASSIGNMENT REPOSITORY
 * ======================================================================================
 */
class DummyAssignmentRepository implements AssignmentRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForCourse(int $courseId): array
    {
        return collect($this->dummyData->studiumAssignments())
            ->where('course_id', $courseId)
            ->map(function ($assignment) {
                $assignment['type'] = collect($this->dummyData->studiumAssignmentTypes())
                    ->firstWhere('id', $assignment['type_id']);

                return $assignment;
            })
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->studiumAssignments())
            ->firstWhere('id', $id);
    }

    public function findWithType(int $id): ?array
    {
        $assignment = $this->find($id);
        if (!$assignment) {
            return null;
        }

        $assignment['type'] = collect($this->dummyData->studiumAssignmentTypes())
            ->firstWhere('id', $assignment['type_id']);

        return $assignment;
    }

    public function getUpcoming(int $userId, int $limit = 10): array
    {
        // Get user's programs
        $programIds = collect($this->dummyData->studiumPrograms())
            ->where('user_id', $userId)
            ->pluck('id')
            ->toArray();

        // Get semesters in those programs
        $semesterIds = collect($this->dummyData->studiumSemesters())
            ->whereIn('program_id', $programIds)
            ->pluck('id')
            ->toArray();

        // Get courses in those semesters
        $courseIds = collect($this->dummyData->studiumCourses())
            ->whereIn('semester_id', $semesterIds)
            ->pluck('id')
            ->toArray();

        // Get upcoming assignments
        $now = now()->toDateTimeString();

        return collect($this->dummyData->studiumAssignments())
            ->whereIn('course_id', $courseIds)
            ->filter(fn ($a) => $a['deadline'] !== null && $a['deadline'] > $now)
            ->sortBy('deadline')
            ->take($limit)
            ->map(function ($assignment) {
                $assignment['type'] = collect($this->dummyData->studiumAssignmentTypes())
                    ->firstWhere('id', $assignment['type_id']);

                // Also attach course info
                $assignment['course'] = collect($this->dummyData->studiumCourses())
                    ->firstWhere('id', $assignment['course_id']);

                return $assignment;
            })
            ->values()
            ->toArray();
    }

    public function getTypes(int $userId): array
    {
        return collect($this->dummyData->studiumAssignmentTypes())
            ->where('user_id', $userId)
            ->sortBy('order')
            ->values()
            ->toArray();
    }
}
