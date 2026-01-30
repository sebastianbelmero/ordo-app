<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\Repositories\Opus\ProjectRepositoryInterface;
use App\Contracts\Repositories\Opus\StatusRepositoryInterface;
use App\Contracts\Repositories\Opus\TaskRepositoryInterface;
use App\Contracts\Repositories\Opus\WorkspaceRepositoryInterface;
use App\Contracts\Repositories\Studium\AssignmentRepositoryInterface;
use App\Contracts\Repositories\Studium\CourseRepositoryInterface;
use App\Contracts\Repositories\Studium\ProgramRepositoryInterface;
use App\Contracts\Repositories\Studium\SemesterRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Repositories\Vocatio\JobRepositoryInterface;
use App\Contracts\Repositories\Vocatio\JobShareRepositoryInterface;
use App\Contracts\Repositories\Vocatio\PipelineRepositoryInterface;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Repositories\Eloquent\Opus\EloquentProjectRepository;
use App\Repositories\Eloquent\Opus\EloquentStatusRepository;
use App\Repositories\Eloquent\Opus\EloquentTaskRepository;
use App\Repositories\Eloquent\Opus\EloquentWorkspaceRepository;
use App\Repositories\Eloquent\Studium\EloquentAssignmentRepository;
use App\Repositories\Eloquent\Studium\EloquentCourseRepository;
use App\Repositories\Eloquent\Studium\EloquentProgramRepository;
use App\Repositories\Eloquent\Studium\EloquentSemesterRepository;
use App\Repositories\Eloquent\Vocatio\EloquentJobRepository;
use App\Repositories\Eloquent\Vocatio\EloquentJobShareRepository;
use App\Repositories\Eloquent\Vocatio\EloquentPipelineRepository;
use Illuminate\Support\ServiceProvider;

/**
 * ======================================================================================
 * REPOSITORY SERVICE PROVIDER
 * ======================================================================================
 *
 * Provider ini menghubungkan Interface dengan Implementasi Eloquent (Database).
 *
 * ======================================================================================
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // ==========================================================================
        // USER REPOSITORY
        // ==========================================================================
        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class
        );

        // ==========================================================================
        // OPUS REPOSITORIES
        // ==========================================================================
        $this->app->bind(
            WorkspaceRepositoryInterface::class,
            EloquentWorkspaceRepository::class
        );

        $this->app->bind(
            ProjectRepositoryInterface::class,
            EloquentProjectRepository::class
        );

        $this->app->bind(
            TaskRepositoryInterface::class,
            EloquentTaskRepository::class
        );

        $this->app->bind(
            StatusRepositoryInterface::class,
            EloquentStatusRepository::class
        );

        // ==========================================================================
        // STUDIUM REPOSITORIES
        // ==========================================================================
        $this->app->bind(
            ProgramRepositoryInterface::class,
            EloquentProgramRepository::class
        );

        $this->app->bind(
            SemesterRepositoryInterface::class,
            EloquentSemesterRepository::class
        );

        $this->app->bind(
            CourseRepositoryInterface::class,
            EloquentCourseRepository::class
        );

        $this->app->bind(
            AssignmentRepositoryInterface::class,
            EloquentAssignmentRepository::class
        );

        // ==========================================================================
        // VOCATIO REPOSITORIES
        // ==========================================================================
        $this->app->bind(
            PipelineRepositoryInterface::class,
            EloquentPipelineRepository::class
        );

        $this->app->bind(
            JobRepositoryInterface::class,
            EloquentJobRepository::class
        );

        $this->app->bind(
            JobShareRepositoryInterface::class,
            EloquentJobShareRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
