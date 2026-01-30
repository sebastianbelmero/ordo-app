<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Studium;

use App\Contracts\Repositories\Studium\ProgramRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY STUDIUM PROGRAM REPOSITORY
 * ======================================================================================
 */
class DummyProgramRepository implements ProgramRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForUser(int $userId): array
    {
        return collect($this->dummyData->studiumPrograms())
            ->where('user_id', $userId)
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->studiumPrograms())
            ->firstWhere('id', $id);
    }

    public function findWithSemesters(int $id): ?array
    {
        $program = $this->find($id);
        if (!$program) {
            return null;
        }

        $program['semesters'] = collect($this->dummyData->studiumSemesters())
            ->where('program_id', $id)
            ->values()
            ->toArray();

        return $program;
    }

    public function findWithFullHierarchy(int $id): ?array
    {
        $program = $this->find($id);
        if (!$program) {
            return null;
        }

        $program['semesters'] = collect($this->dummyData->studiumSemesters())
            ->where('program_id', $id)
            ->map(function ($semester) {
                $semester['courses'] = collect($this->dummyData->studiumCourses())
                    ->where('semester_id', $semester['id'])
                    ->map(function ($course) {
                        $course['assignments'] = collect($this->dummyData->studiumAssignments())
                            ->where('course_id', $course['id'])
                            ->map(function ($assignment) {
                                $assignment['type'] = collect($this->dummyData->studiumAssignmentTypes())
                                    ->firstWhere('id', $assignment['type_id']);

                                return $assignment;
                            })
                            ->values()
                            ->toArray();

                        return $course;
                    })
                    ->values()
                    ->toArray();

                return $semester;
            })
            ->values()
            ->toArray();

        return $program;
    }
}
