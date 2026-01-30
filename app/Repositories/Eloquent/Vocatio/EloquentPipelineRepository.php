<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Vocatio;

use App\Contracts\Repositories\Vocatio\PipelineRepositoryInterface;
use App\Models\Vocatio\Pipeline;

class EloquentPipelineRepository implements PipelineRepositoryInterface
{
    public function allForUser(int $userId): array
    {
        return Pipeline::where('user_id', $userId)
            ->withCount('jobs')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function find(int $id): ?array
    {
        $pipeline = Pipeline::find($id);

        return $pipeline?->toArray();
    }

    public function findWithJobs(int $id): ?array
    {
        $pipeline = Pipeline::with(['jobs.status'])
            ->withCount('jobs')
            ->find($id);

        return $pipeline?->toArray();
    }

    public function findDefault(int $userId): ?array
    {
        $pipeline = Pipeline::where('user_id', $userId)
            ->where('is_default', true)
            ->first();

        return $pipeline?->toArray();
    }

    public function create(array $data): array
    {
        // If this is the first pipeline or is_default is true, set as default
        if (! empty($data['is_default'])) {
            Pipeline::where('user_id', $data['user_id'])
                ->update(['is_default' => false]);
        }

        $pipeline = Pipeline::create($data);

        // If no default exists, make this the default
        if (! Pipeline::where('user_id', $data['user_id'])->where('is_default', true)->exists()) {
            $pipeline->update(['is_default' => true]);
        }

        return $pipeline->toArray();
    }

    public function update(int $id, array $data): ?array
    {
        /** @var Pipeline|null $pipeline */
        $pipeline = Pipeline::find($id);
        if (! $pipeline) {
            return null;
        }

        // If setting as default, unset other defaults
        if (! empty($data['is_default'])) {
            Pipeline::where('user_id', $pipeline->user_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $pipeline->update($data);

        /** @var Pipeline $fresh */
        $fresh = $pipeline->fresh();

        return $fresh->toArray();
    }

    public function delete(int $id): bool
    {
        /** @var Pipeline|null $pipeline */
        $pipeline = Pipeline::find($id);
        if (! $pipeline) {
            return false;
        }

        $wasDefault = $pipeline->is_default;
        $userId = $pipeline->user_id;
        $pipeline->delete();

        // If deleted pipeline was default, make another one default
        if ($wasDefault) {
            Pipeline::where('user_id', $userId)
                ->first()
                ?->update(['is_default' => true]);
        }

        return true;
    }
}
