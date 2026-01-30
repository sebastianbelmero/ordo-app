<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Studium;

use App\Contracts\Repositories\Studium\CourseRepositoryInterface;
use App\Models\Studium\Course;

class EloquentCourseRepository implements CourseRepositoryInterface
{
    public function allForSemester(int $semesterId): array
    {
        return Course::where('semester_id', $semesterId)
            ->withCount('assignments')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $course = Course::with('semester')->find($id);

        return $course?->toArray();
    }

    public function findWithAssignments(int $id): ?array
    {
        $course = Course::with([
            'semester.program',
            'assignments' => fn ($q) => $q->orderBy('deadline'),
            'assignments.type',
        ])
            ->withCount('assignments')
            ->find($id);

        return $course?->toArray();
    }

    public function create(array $data): array
    {
        return Course::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Course|null $course */
        $course = Course::find($id);
        if (! $course) {
            return null;
        }

        $course->update($data);

        /** @var Course $fresh */
        $fresh = $course->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Course|null $course */
        $course = Course::find($id);
        if (! $course) {
            return false;
        }

        return (bool) $course->delete();
    }
}
