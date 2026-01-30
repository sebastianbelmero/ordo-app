<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Opus\OpusService;
use App\Services\Studium\StudiumService;
use App\Services\UserService;
use App\Services\Vocatio\VocatioService;
use App\Support\DummyData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        protected DummyData $dummyData,
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
        $tasks = collect($this->dummyData->opusTasks());
        $projects = collect($this->dummyData->opusProjects())->where('user_id', $userId);
        $projectIds = $projects->pluck('id')->toArray();
        $userTasks = $tasks->whereIn('project_id', $projectIds);
        $taskStatuses = collect($this->dummyData->opusTaskStatuses())->where('user_id', $userId);

        // Task by status chart data
        $tasksByStatus = $taskStatuses->map(function ($status) use ($userTasks) {
            return [
                'status' => $status['name'],
                'count' => $userTasks->where('status_id', $status['id'])->count(),
                'color' => $status['color'],
            ];
        })->values()->toArray();

        // Task priority distribution
        $taskPriorities = collect($this->dummyData->opusTaskPriorities())->where('user_id', $userId);
        $tasksByPriority = $taskPriorities->map(function ($priority) use ($userTasks) {
            return [
                'priority' => $priority['name'],
                'count' => $userTasks->where('priority_id', $priority['id'])->count(),
                'color' => $priority['color'],
            ];
        })->values()->toArray();

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
        $assignments = collect($this->dummyData->studiumAssignments());
        $courses = collect($this->dummyData->studiumCourses());
        $semesters = collect($this->dummyData->studiumSemesters());
        $programs = collect($this->dummyData->studiumPrograms())->where('user_id', $userId);

        $programIds = $programs->pluck('id')->toArray();
        $semesterIds = $semesters->whereIn('program_id', $programIds)->pluck('id')->toArray();
        $courseIds = $courses->whereIn('semester_id', $semesterIds)->pluck('id')->toArray();
        $userAssignments = $assignments->whereIn('course_id', $courseIds);

        // Assignment types distribution
        $assignmentTypes = collect($this->dummyData->studiumAssignmentTypes());
        $assignmentsByType = $assignmentTypes->map(function ($type) use ($userAssignments) {
            return [
                'type' => $type['name'],
                'count' => $userAssignments->where('type_id', $type['id'])->count(),
                'color' => $type['color'],
            ];
        })->filter(fn($item) => $item['count'] > 0)->values()->toArray();

        // Assignment completion (graded vs ungraded)
        $completedCount = $userAssignments->whereNotNull('grade')->count();
        $pendingCount = $userAssignments->whereNull('grade')->count();

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
        $jobs = collect($this->dummyData->vocatioJobs())->where('user_id', $userId);
        $jobStatuses = collect($this->dummyData->vocatioJobStatuses())->where('user_id', $userId);
        $pipelines = collect($this->dummyData->vocatioPipelines())->where('user_id', $userId);

        // Jobs by status (for funnel chart)
        $jobsByStatus = $jobStatuses->map(function ($status) use ($jobs) {
            return [
                'status' => $status['name'],
                'count' => $jobs->where('status_id', $status['id'])->count(),
                'color' => $status['color'],
                'order' => $status['order'],
            ];
        })->sortBy('order')->values()->toArray();

        // Jobs by pipeline
        $jobsByPipeline = $pipelines->map(function ($pipeline) use ($jobs) {
            return [
                'pipeline' => $pipeline['name'],
                'count' => $jobs->where('pipeline_id', $pipeline['id'])->count(),
            ];
        })->values()->toArray();

        // Interest level distribution
        $interestLevels = [
            ['level' => '⭐', 'count' => $jobs->where('level_of_interest', 1)->count()],
            ['level' => '⭐⭐', 'count' => $jobs->where('level_of_interest', 2)->count()],
            ['level' => '⭐⭐⭐', 'count' => $jobs->where('level_of_interest', 3)->count()],
            ['level' => '⭐⭐⭐⭐', 'count' => $jobs->where('level_of_interest', 4)->count()],
            ['level' => '⭐⭐⭐⭐⭐', 'count' => $jobs->where('level_of_interest', 5)->count()],
        ];

        return [
            'jobsByStatus' => $jobsByStatus,
            'jobsByPipeline' => $jobsByPipeline,
            'interestLevels' => $interestLevels,
        ];
    }
}
