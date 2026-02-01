<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Opus\TaskPriority;
use App\Models\Opus\TaskStatus;
use App\Models\Studium\Assignment;
use App\Models\Studium\AssignmentType;
use App\Models\Studium\Course;
use App\Models\Studium\Program;
use App\Models\Studium\Semester;
use App\Models\Vocatio\Job;
use App\Models\Vocatio\JobStatus;
use App\Models\Vocatio\Pipeline;
use App\Services\Opus\OpusService;
use App\Services\Studium\StudiumService;
use App\Services\UserService;
use App\Services\Vocatio\VocatioService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ======================================================================================
 * DASHBOARD CONTROLLER
 * ======================================================================================
 *
 * Controller untuk halaman dashboard utama.
 * Menampilkan ringkasan dari semua modul (Opus, Studium, Vocatio).
 *
 * ======================================================================================
 */
class DashboardController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected OpusService $opusService,
        protected StudiumService $studiumService,
        protected VocatioService $vocatioService,
    ) {}

    /**
     * Display the dashboard.
     *
     * Route: GET /dashboard
     * View: Pages/Dashboard.tsx
     */
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        // Get user with modules
        $user = $this->userService->getUserWithRelations($userId);

        // Get enabled modules
        $enabledModules = collect($user['modules'] ?? [])
            ->where('is_enabled', true)
            ->pluck('module')
            ->toArray();

        $dashboardData = [
            'user' => $user,
        ];

        // Load data untuk modul yang diaktifkan
        if (in_array('opus', $enabledModules)) {
            $dashboardData['opus'] = [
                'workspaces' => $this->opusService->getWorkspaces($userId),
                'charts' => $this->getOpusChartData($userId),
            ];
        }

        if (in_array('studium', $enabledModules)) {
            $dashboardData['studium'] = [
                'programs' => $this->studiumService->getPrograms($userId),
                'upcomingAssignments' => $this->studiumService->getUpcomingAssignments($userId, 5),
                'charts' => $this->getStudiumChartData($userId),
            ];
        }

        if (in_array('vocatio', $enabledModules)) {
            $dashboardData['vocatio'] = [
                'pipelines' => $this->vocatioService->getPipelines($userId),
                'pendingShares' => $this->vocatioService->getPendingShares($userId),
                'charts' => $this->getVocatioChartData($userId),
            ];
        }

        return Inertia::render('Dashboard', $dashboardData);
    }

    /**
     * Get chart data for Opus module.
     */
    private function getOpusChartData(int $userId): array
    {
        // Get task statuses with task counts for user's workspaces
        $taskStatuses = TaskStatus::where('user_id', $userId)
            ->withCount(['tasks' => function ($query) use ($userId) {
                $query->whereHas('project.workspace', fn ($q) => $q->where('user_id', $userId));
            }])
            ->orderBy('order')
            ->get();

        $tasksByStatus = $taskStatuses->map(fn ($status) => [
            'status' => $status->name,
            'count' => $status->tasks_count,
            'color' => $status->color,
        ])->values()->toArray();

        // Get task priorities with task counts
        $taskPriorities = TaskPriority::where('user_id', $userId)
            ->withCount(['tasks' => function ($query) use ($userId) {
                $query->whereHas('project.workspace', fn ($q) => $q->where('user_id', $userId));
            }])
            ->orderBy('level')
            ->get();

        $tasksByPriority = $taskPriorities->map(fn ($priority) => [
            'priority' => $priority->name,
            'count' => $priority->tasks_count,
            'color' => $priority->color,
        ])->values()->toArray();

        return [
            'tasksByStatus' => $tasksByStatus,
            'tasksByPriority' => $tasksByPriority,
        ];
    }

    /**
     * Get chart data for Studium module.
     */
    private function getStudiumChartData(int $userId): array
    {
        // Get user's programs → semesters → courses → assignments
        $programIds = Program::where('user_id', $userId)->pluck('id');
        $semesterIds = Semester::whereIn('program_id', $programIds)->pluck('id');
        $courseIds = Course::whereIn('semester_id', $semesterIds)->pluck('id');

        // Assignment types with counts
        $assignmentTypes = AssignmentType::where('user_id', $userId)
            ->withCount(['assignments' => fn ($query) => $query->whereIn('course_id', $courseIds)])
            ->get();

        $assignmentsByType = $assignmentTypes
            ->filter(fn ($type) => $type->assignments_count > 0)
            ->map(fn ($type) => [
                'type' => $type->name,
                'count' => $type->assignments_count,
                'color' => $type->color,
            ])
            ->values()
            ->toArray();

        // Assignment completion status (graded vs ungraded)
        $completedCount = Assignment::whereIn('course_id', $courseIds)->whereNotNull('grade')->count();
        $pendingCount = Assignment::whereIn('course_id', $courseIds)->whereNull('grade')->count();

        $completionData = [
            ['status' => 'Completed', 'count' => $completedCount, 'color' => '#22c55e'],
            ['status' => 'Pending', 'count' => $pendingCount, 'color' => '#f59e0b'],
        ];

        return [
            'assignmentsByType' => $assignmentsByType,
            'completionStatus' => $completionData,
        ];
    }

    /**
     * Get chart data for Vocatio module.
     */
    private function getVocatioChartData(int $userId): array
    {
        // Jobs by status (for funnel chart)
        $jobStatuses = JobStatus::where('user_id', $userId)
            ->withCount(['jobs' => fn ($query) => $query->where('user_id', $userId)])
            ->orderBy('order')
            ->get();

        $jobsByStatus = $jobStatuses->map(fn ($status) => [
            'status' => $status->name,
            'count' => $status->jobs_count,
            'color' => $status->color,
            'order' => $status->order,
        ])->values()->toArray();

        // Jobs by pipeline
        $pipelines = Pipeline::where('user_id', $userId)
            ->withCount(['jobs' => fn ($query) => $query->where('user_id', $userId)])
            ->get();

        $jobsByPipeline = $pipelines->map(fn ($pipeline) => [
            'pipeline' => $pipeline->name,
            'count' => $pipeline->jobs_count,
        ])->values()->toArray();

        // Interest level distribution
        $interestLevels = collect([1, 2, 3, 4, 5])->map(fn ($level) => [
            'level' => str_repeat('⭐', $level),
            'count' => Job::where('user_id', $userId)->where('level_of_interest', $level)->count(),
        ])->toArray();

        return [
            'jobsByStatus' => $jobsByStatus,
            'jobsByPipeline' => $jobsByPipeline,
            'interestLevels' => $interestLevels,
        ];
    }
}
