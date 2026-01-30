<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent\Vocatio;

use App\Contracts\Repositories\Vocatio\JobShareRepositoryInterface;
use App\Models\Vocatio\JobShare;

class EloquentJobShareRepository implements JobShareRepositoryInterface
{
    public function sentByUser(int $userId): array
    {
        return JobShare::where('sender_id', $userId)
            ->with(['job', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function receivedByUser(int $userId): array
    {
        return JobShare::where('receiver_id', $userId)
            ->with(['job', 'sender'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function pendingForUser(int $userId): array
    {
        return JobShare::where('receiver_id', $userId)
            ->where('status', 'pending')
            ->with(['job', 'sender'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function find(string $id): ?array
    {
        $share = JobShare::with(['job.status', 'sender', 'receiver'])
            ->find($id);

        return $share?->toArray();
    }

    public function create(array $data): array
    {
        return JobShare::create($data)->toArray();
    }

    public function respond(string $id, string $status): ?array
    {
        /** @var JobShare|null $share */
        $share = JobShare::find($id);
        if (! $share) {
            return null;
        }

        $share->update(['status' => $status]);

        /** @var JobShare $fresh */
        $fresh = $share->fresh(['job', 'sender', 'receiver']);

        return $fresh->toArray();
    }

    public function updateStatus(string $id, string $status): ?array
    {
        /** @var JobShare|null $share */
        $share = JobShare::find($id);
        if (! $share) {
            return null;
        }

        $share->update(['status' => $status]);

        /** @var JobShare $fresh */
        $fresh = $share->fresh(['job', 'sender', 'receiver']);

        return $fresh->toArray();
    }

    public function delete(string $id): bool
    {
        /** @var JobShare|null $share */
        $share = JobShare::find($id);
        if (! $share) {
            return false;
        }

        return (bool) $share->delete();
    }
}
