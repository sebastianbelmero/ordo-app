<?php

declare(strict_types=1);

namespace App\Services\Vocatio;

use App\Contracts\Repositories\Vocatio\JobRepositoryInterface;
use App\Contracts\Repositories\Vocatio\JobShareRepositoryInterface;
use App\Contracts\Repositories\Vocatio\PipelineRepositoryInterface;
use App\Models\User;
use App\Services\Google\GoogleCalendarService;

/**
 * ======================================================================================
 * VOCATIO SERVICE
 * ======================================================================================
 *
 * Service untuk modul Vocatio (Job Application Tracker).
 *
 * ======================================================================================
 */
class VocatioService
{
    public function __construct(
        protected PipelineRepositoryInterface $pipelineRepository,
        protected JobRepositoryInterface $jobRepository,
        protected JobShareRepositoryInterface $jobShareRepository,
        protected GoogleCalendarService $googleCalendarService,
    ) {}

    // ==================================================================================
    // PIPELINES
    // ==================================================================================

    /**
     * Get all pipelines for a user.
     */
    public function getPipelines(int $userId): array
    {
        return [
            'data' => $this->pipelineRepository->allForUser($userId),
        ];
    }

    /**
     * Get single pipeline.
     */
    public function getPipeline(int $id): ?array
    {
        return $this->pipelineRepository->find($id);
    }

    /**
     * Get pipeline with jobs.
     */
    public function getPipelineWithJobs(int $id): ?array
    {
        return $this->pipelineRepository->findWithJobs($id);
    }

    /**
     * Get default pipeline for user.
     */
    public function getDefaultPipeline(int $userId): ?array
    {
        return $this->pipelineRepository->findDefault($userId);
    }

    // ==================================================================================
    // JOBS
    // ==================================================================================

    /**
     * Get all jobs in a pipeline.
     */
    public function getJobs(int $pipelineId): array
    {
        return [
            'data' => $this->jobRepository->allForPipeline($pipelineId),
        ];
    }

    /**
     * Get all jobs for a user (across all pipelines).
     */
    public function getAllJobsForUser(int $userId): array
    {
        return [
            'data' => $this->jobRepository->allForUser($userId),
        ];
    }

    /**
     * Get single job.
     */
    public function getJob(string $id): ?array
    {
        return $this->jobRepository->findWithStatus($id);
    }

    /**
     * Get Kanban board data for a pipeline.
     */
    public function getKanbanBoard(int $pipelineId, int $userId): array
    {
        return [
            'data' => $this->jobRepository->getKanbanBoard($pipelineId, $userId),
        ];
    }

    /**
     * Get job statuses for user.
     */
    public function getJobStatuses(int $userId): array
    {
        return [
            'data' => $this->jobRepository->getStatuses($userId),
        ];
    }

    /**
     * Create a job status.
     */
    public function createJobStatus(array $data): array
    {
        return $this->jobRepository->createStatus($data);
    }

    /**
     * Update a job status entity (for settings).
     */
    public function updateJobStatusSettings(int $id, array $data): ?array
    {
        return $this->jobRepository->updateStatusEntity($id, $data);
    }

    /**
     * Delete a job status.
     */
    public function deleteJobStatus(int $id): bool
    {
        return $this->jobRepository->deleteStatus($id);
    }

    // ==================================================================================
    // JOB SHARES
    // ==================================================================================

    /**
     * Get shares sent by user.
     */
    public function getSentShares(int $userId): array
    {
        return [
            'data' => $this->jobShareRepository->sentByUser($userId),
        ];
    }

    /**
     * Get shares received by user.
     */
    public function getReceivedShares(int $userId): array
    {
        return [
            'data' => $this->jobShareRepository->receivedByUser($userId),
        ];
    }

    /**
     * Get pending shares for user (notification badge).
     */
    public function getPendingShares(int $userId): array
    {
        return [
            'data' => $this->jobShareRepository->pendingForUser($userId),
        ];
    }

    /**
     * Get single share.
     */
    public function getShare(string $id): ?array
    {
        return $this->jobShareRepository->find($id);
    }

    // ==================================================================================
    // PIPELINE CRUD
    // ==================================================================================

    /**
     * Create a new pipeline.
     */
    public function createPipeline(array $data): array
    {
        return $this->pipelineRepository->create($data);
    }

    /**
     * Update a pipeline.
     */
    public function updatePipeline(int $id, array $data): ?array
    {
        return $this->pipelineRepository->update($id, $data);
    }

    /**
     * Delete a pipeline.
     */
    public function deletePipeline(int $id): bool
    {
        return $this->pipelineRepository->delete($id);
    }

    // ==================================================================================
    // JOB CRUD
    // ==================================================================================

    /**
     * Create a new job.
     */
    public function createJob(array $data, ?User $user = null): array
    {
        $job = $this->jobRepository->create($data);

        // Sync to Google Calendar if user is provided and has due_date
        if ($user && ! empty($job['due_date'])) {
            $eventId = $this->googleCalendarService->syncJob($user, $job);
            if ($eventId) {
                $this->jobRepository->update($job['id'], [
                    'google_calendar_event_id' => $eventId,
                ]);
                $job['google_calendar_event_id'] = $eventId;
            }
        }

        return $job;
    }

    /**
     * Update a job.
     */
    public function updateJob(string $id, array $data, ?User $user = null): ?array
    {
        $job = $this->jobRepository->update($id, $data);

        // Sync to Google Calendar if user is provided
        if ($job && $user && ! empty($job['due_date'])) {
            $eventId = $this->googleCalendarService->syncJob(
                $user,
                $job,
                $job['google_calendar_event_id'] ?? null
            );
            if ($eventId && $eventId !== ($job['google_calendar_event_id'] ?? null)) {
                $this->jobRepository->update($id, [
                    'google_calendar_event_id' => $eventId,
                ]);
                $job['google_calendar_event_id'] = $eventId;
            }
        }

        return $job;
    }

    /**
     * Update job status (for Kanban drag & drop).
     */
    public function updateJobStatus(string $id, int $statusId, ?int $position = null): ?array
    {
        return $this->jobRepository->updateJobStatus($id, $statusId, $position);
    }

    /**
     * Delete a job.
     */
    public function deleteJob(string $id, ?User $user = null): bool
    {
        // Get job first to remove from Google Calendar
        $job = $this->jobRepository->findWithStatus($id);

        if ($job && $user && ! empty($job['google_calendar_event_id'])) {
            $this->googleCalendarService->removeEvent($user, $job['google_calendar_event_id']);
        }

        return $this->jobRepository->delete($id);
    }

    // ==================================================================================
    // JOB SHARE CRUD
    // ==================================================================================

    /**
     * Create a new job share.
     */
    public function createShare(array $data): array
    {
        return $this->jobShareRepository->create($data);
    }

    /**
     * Respond to a share (accept/reject).
     * If accepted, copy the job to receiver's default pipeline.
     */
    public function respondToShare(string $id, string $status, int $receiverId): ?array
    {
        // Get share data first
        $share = $this->jobShareRepository->find($id);
        if (! $share) {
            return null;
        }

        // If accepting, clone the job to receiver's pipeline
        if ($status === 'accepted' && isset($share['job'])) {
            $originalJob = $share['job'];

            // Get receiver's default pipeline, or first pipeline
            $defaultPipeline = $this->pipelineRepository->findDefault($receiverId);
            if (! $defaultPipeline) {
                // Get first pipeline for user
                $pipelines = $this->pipelineRepository->allForUser($receiverId);
                $defaultPipeline = $pipelines[0] ?? null;
            }

            // If no pipeline exists, create one
            if (! $defaultPipeline) {
                $defaultPipeline = $this->pipelineRepository->create([
                    'user_id' => $receiverId,
                    'name' => 'My Pipeline',
                    'is_default' => true,
                ]);
            }

            if ($defaultPipeline) {
                // Get default status (first status by order)
                $statuses = $this->jobRepository->getStatuses($receiverId);
                $defaultStatus = collect($statuses)->sortBy('order')->first();

                // Clone job to receiver's pipeline
                $notes = $originalJob['notes'] ?? '';
                if ($notes) {
                    $notes .= "\n\n";
                }
                $notes .= '[Shared by '.($share['sender']['name'] ?? 'someone').']';

                $this->jobRepository->create([
                    'company' => $originalJob['company'],
                    'position' => $originalJob['position'],
                    'url' => $originalJob['url'],
                    'location' => $originalJob['location'],
                    'notes' => $notes,
                    'due_date' => $originalJob['due_date'],
                    'level_of_interest' => $originalJob['level_of_interest'],
                    'salary_min' => $originalJob['salary_min'],
                    'salary_max' => $originalJob['salary_max'],
                    'user_id' => $receiverId,
                    'pipeline_id' => $defaultPipeline['id'],
                    'status_id' => $defaultStatus['id'] ?? null,
                ]);
            }
        }

        return $this->jobShareRepository->respond($id, $status);
    }

    /**
     * Delete a share.
     */
    public function deleteShare(string $id): bool
    {
        return $this->jobShareRepository->delete($id);
    }

    // ==================================================================================
    // STATUS INITIALIZATION
    // ==================================================================================

    /**
     * Initialize default statuses for a new user.
     */
    public function initializeStatusesForUser(int $userId): void
    {
        $this->jobRepository->createDefaultStatusesForUser($userId);
    }
}
