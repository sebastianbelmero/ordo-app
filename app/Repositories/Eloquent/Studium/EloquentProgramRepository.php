<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Studium;

use App\Contracts\Repositories\Studium\ProgramRepositoryInterface;
use App\Models\Studium\Program;

class EloquentProgramRepository implements ProgramRepositoryInterface
{
    public function allForUser(int $userId): array
    {
        return Program::where('user_id', $userId)
            ->withCount(['semesters', 'courses'])
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $program = Program::find($id);

        return $program?->toArray();
    }

    public function findWithSemesters(int $id): ?array
    {
        $program = Program::with(['semesters' => fn ($q) => $q->orderBy('name')])
            ->withCount(['semesters', 'courses'])
            ->find($id);

        return $program?->toArray();
    }

    public function findWithFullHierarchy(int $id): ?array
    {
        $program = Program::with([
            'semesters' => fn ($q) => $q->orderBy('name'),
            'semesters.courses' => fn ($q) => $q->orderBy('name'),
            'semesters.courses.assignments' => fn ($q) => $q->orderBy('deadline'),
            'semesters.courses.assignments.type',
        ])
            ->withCount(['semesters', 'courses'])
            ->find($id);

        return $program?->toArray();
    }

    public function create(array $data): array
    {
        return Program::create($data)->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Program|null $program */
        $program = Program::find($id);
        if (! $program) {
            return null;
        }

        $program->update($data);

        /** @var Program $fresh */
        $fresh = $program->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Program|null $program */
        $program = Program::find($id);
        if (! $program) {
            return false;
        }

        return (bool) $program->delete();
    }
}
