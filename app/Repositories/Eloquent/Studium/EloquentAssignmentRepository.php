<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Studium;

use App\Contracts\Repositories\Studium\AssignmentRepositoryInterface;
use App\Models\Studium\Assignment;
use App\Models\Studium\AssignmentType;

class EloquentAssignmentRepository implements AssignmentRepositoryInterface
{
    public function allForCourse(int $courseId): array
    {
        return Assignment::where('course_id', $courseId)
            ->with('type')
            ->orderBy('deadline')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $assignment = Assignment::find($id);

        return $assignment?->toArray();
    }

    public function findWithType(int $id): ?array
    {
        $assignment = Assignment::with(['type', 'course.semester.program'])
            ->find($id);

        return $assignment?->toArray();
    }

    public function getUpcoming(int $userId, int $limit = 10): array
    {
        return Assignment::whereHas('course.semester.program', fn ($q) => $q->where('user_id', $userId))
            ->with(['type', 'course.semester.program'])
            ->upcoming()
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getTypes(int $userId): array
    {
        return AssignmentType::where('user_id', $userId)
            ->orderBy('order')
            ->get()
            ->toArray();
    }

    public function create(array $data): array
    {
        return Assignment::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Assignment|null $assignment */
        $assignment = Assignment::find($id);
        if (! $assignment) {
            return null;
        }

        $assignment->update($data);

        /** @var Assignment $fresh */
        $fresh = $assignment->fresh(['type']);

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = Assignment::find($id);
        if (! $assignment) {
            return false;
        }

        return (bool) $assignment->delete();
    }

    public function createType(array $data): array
    {
        return AssignmentType::create($data)->toArray();
    }

    public function updateType(int $id, array $data): ?array
    {
        $type = AssignmentType::find($id);
        if ($type && !$type->is_system) {
            $type->update($data);
            return $type->fresh()->toArray();
        }
        return $type?->toArray();
    }

    public function deleteType(int $id): bool
    {
        $type = AssignmentType::find($id);
        if ($type && !$type->is_system) {
            return $type->delete();
        }
        return false;
    }

    /**
     * Create default assignment types for a new user.
     */
    public function createDefaultTypesForUser(int $userId): void
    {
        $types = [
            ['slug' => 'tugas', 'name' => 'Tugas', 'color' => '#3b82f6', 'order' => 0, 'is_system' => true],
            ['slug' => 'kuis', 'name' => 'Kuis', 'color' => '#8b5cf6', 'order' => 1, 'is_system' => true],
            ['slug' => 'uts', 'name' => 'UTS', 'color' => '#f97316', 'order' => 2, 'is_system' => true],
            ['slug' => 'uas', 'name' => 'UAS', 'color' => '#ef4444', 'order' => 3, 'is_system' => true],
            ['slug' => 'proyek', 'name' => 'Proyek', 'color' => '#22c55e', 'order' => 4, 'is_system' => true],
        ];

        foreach ($types as $type) {
            AssignmentType::create(array_merge($type, ['user_id' => $userId]));
        }
    }
}
