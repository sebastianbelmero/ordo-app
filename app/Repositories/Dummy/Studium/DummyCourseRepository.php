<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Studium;

use App\Contracts\Repositories\Studium\CourseRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY STUDIUM COURSE REPOSITORY
 * ======================================================================================
 */
class DummyCourseRepository implements CourseRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForSemester(int $semesterId): array
    {
        return collect($this->dummyData->studiumCourses())
            ->where('semester_id', $semesterId)
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->studiumCourses())
            ->firstWhere('id', $id);
    }

    public function findWithAssignments(int $id): ?array
    {
        $course = $this->find($id);
        if (!$course) {
            return null;
        }

        $course['assignments'] = collect($this->dummyData->studiumAssignments())
            ->where('course_id', $id)
            ->map(function ($assignment) {
                $assignment['type'] = collect($this->dummyData->studiumAssignmentTypes())
                    ->firstWhere('id', $assignment['type_id']);

                return $assignment;
            })
            ->values()
            ->toArray();

        return $course;
    }
}
