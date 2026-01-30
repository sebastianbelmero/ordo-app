<?php

use App\Http\Controllers\Vocatio\JobController;
use App\Http\Controllers\Vocatio\JobShareController;
use App\Http\Controllers\Vocatio\PipelineController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vocatio Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul Vocatio (Job Application Tracker).
|
| STRUKTUR URL:
| - /vocatio/pipelines                       - List pipelines
| - /vocatio/pipelines/{pipeline}            - Show pipeline
| - /vocatio/pipelines/{pipeline}/board      - Kanban board
| - /vocatio/pipelines/{pipeline}/jobs       - List jobs in pipeline
| - /vocatio/jobs                            - All jobs (across pipelines)
| - /vocatio/jobs/{job}                      - Show job
| - /vocatio/shares                          - List shares
| - /vocatio/shares/{share}                  - Show share
|
*/

Route::middleware(['auth'])->prefix('vocatio')->name('vocatio.')->group(function () {
    // Pipelines
    Route::get('pipelines', [PipelineController::class, 'index'])->name('pipelines.index');
    Route::get('pipelines/create', [PipelineController::class, 'create'])->name('pipelines.create');
    Route::post('pipelines', [PipelineController::class, 'store'])->name('pipelines.store');
    Route::get('pipelines/{pipeline}', [PipelineController::class, 'show'])->name('pipelines.show');
    Route::get('pipelines/{pipeline}/board', [PipelineController::class, 'board'])->name('pipelines.board');
    Route::get('pipelines/{pipeline}/edit', [PipelineController::class, 'edit'])->name('pipelines.edit');
    Route::put('pipelines/{pipeline}', [PipelineController::class, 'update'])->name('pipelines.update');
    Route::delete('pipelines/{pipeline}', [PipelineController::class, 'destroy'])->name('pipelines.destroy');

    // Jobs (nested under pipeline for listing)
    Route::get('pipelines/{pipeline}/jobs', [JobController::class, 'index'])->name('pipelines.jobs.index');
    Route::get('pipelines/{pipeline}/jobs/create', [JobController::class, 'create'])->name('pipelines.jobs.create');
    Route::post('pipelines/{pipeline}/jobs', [JobController::class, 'store'])->name('pipelines.jobs.store');

    // Jobs (direct access)
    Route::get('jobs', [JobController::class, 'all'])->name('jobs.index');
    Route::get('jobs/{job}', [JobController::class, 'show'])->name('jobs.show');
    Route::get('jobs/{job}/edit', [JobController::class, 'edit'])->name('jobs.edit');
    Route::put('jobs/{job}', [JobController::class, 'update'])->name('jobs.update');
    Route::patch('jobs/{job}/status', [JobController::class, 'updateStatus'])->name('jobs.update-status');
    Route::delete('jobs/{job}', [JobController::class, 'destroy'])->name('jobs.destroy');

    // Shares
    Route::get('shares', [JobShareController::class, 'index'])->name('shares.index');
    Route::get('shares/create', [JobShareController::class, 'create'])->name('shares.create');
    Route::post('shares', [JobShareController::class, 'store'])->name('shares.store');
    Route::get('shares/{share}', [JobShareController::class, 'show'])->name('shares.show');
    Route::patch('shares/{share}/respond', [JobShareController::class, 'respond'])->name('shares.respond');
    Route::delete('shares/{share}', [JobShareController::class, 'destroy'])->name('shares.destroy');
});
