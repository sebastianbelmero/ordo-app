<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Studium;

use App\Contracts\Repositories\Studium\SemesterRepositoryInterface;
use App\Models\Studium\Semester;

class EloquentSemesterRepository implements SemesterRepositoryInterface
{
    public function allForProgram(int $programId): array
    {
        return Semester::where('program_id', $programId)
            ->withCount(['courses', 'assignments'])
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $semester = Semester::with('program')->find($id);

        return $semester?->toArray();
    }

    public function findActive(int $programId): ?array
    {
        $semester = Semester::where('program_id', $programId)
            ->where('is_active', true)
            ->first();

        return $semester?->toArray();
    }

    public function findWithCourses(int $id): ?array
    {
        $semester = Semester::with([
            'program',
            'courses' => fn ($q) => $q->orderBy('name'),
        ])
            ->withCount(['courses', 'assignments'])
            ->find($id);

        return $semester?->toArray();
    }

    public function create(array $data): array
    {
        // If this semester is active, deactivate others in the same program
        if (! empty($data['is_active'])) {
            Semester::where('program_id', $data['program_id'])
                ->update(['is_active' => false]);
        }

        return Semester::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Semester|null $semester */
        $semester = Semester::find($id);
        if (! $semester) {
            return null;
        }

        // If this semester is being set to active, deactivate others
        if (! empty($data['is_active'])) {
            Semester::where('program_id', $semester->program_id)
                ->where('id', '!=', $id)
                ->update(['is_active' => false]);
        }

        $semester->update($data);

        /** @var Semester $fresh */
        $fresh = $semester->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Semester|null $semester */
        $semester = Semester::find($id);
        if (! $semester) {
            return false;
        }

        return (bool) $semester->delete();
    }
}
