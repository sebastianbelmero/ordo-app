<?php

declare(strict_types=1);

namespace App\Repositories\Dummy\Studium;

use App\Contracts\Repositories\Studium\SemesterRepositoryInterface;
use App\Support\DummyData;

/**
 * ======================================================================================
 * DUMMY STUDIUM SEMESTER REPOSITORY
 * ======================================================================================
 */
class DummySemesterRepository implements SemesterRepositoryInterface
{
    public function __construct(
        protected DummyData $dummyData
    ) {}

    public function allForProgram(int $programId): array
    {
        return collect($this->dummyData->studiumSemesters())
            ->where('program_id', $programId)
            ->values()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        return collect($this->dummyData->studiumSemesters())
            ->firstWhere('id', $id);
    }

    public function findActive(int $programId): ?array
    {
        return collect($this->dummyData->studiumSemesters())
            ->where('program_id', $programId)
            ->where('is_active', true)
            ->first();
    }

    public function findWithCourses(int $id): ?array
    {
        $semester = $this->find($id);
        if (!$semester) {
            return null;
        }

        $semester['courses'] = collect($this->dummyData->studiumCourses())
            ->where('semester_id', $id)
            ->values()
            ->toArray();

        return $semester;
    }
}
