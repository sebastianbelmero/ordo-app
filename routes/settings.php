<?php

use App\Http\Controllers\Settings\GoogleCalendarController;
use App\Http\Controllers\Settings\ModulesController;
use App\Http\Controllers\Settings\OpusSettingsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\StudiumSettingsController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\VocatioSettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Modules settings
    Route::get('settings/modules', [ModulesController::class, 'index'])->name('modules.index');
    Route::post('settings/modules/{module}/toggle', [ModulesController::class, 'toggle'])->name('modules.toggle');
    Route::put('settings/modules/order', [ModulesController::class, 'updateOrder'])->name('modules.updateOrder');

    // Opus settings (Project Statuses, Task Statuses, Task Priorities)
    Route::get('settings/opus', [OpusSettingsController::class, 'index'])->name('settings.opus');
    Route::post('settings/opus/project-statuses', [OpusSettingsController::class, 'storeProjectStatus'])->name('settings.opus.project-statuses.store');
    Route::put('settings/opus/project-statuses/{id}', [OpusSettingsController::class, 'updateProjectStatus'])->name('settings.opus.project-statuses.update');
    Route::delete('settings/opus/project-statuses/{id}', [OpusSettingsController::class, 'destroyProjectStatus'])->name('settings.opus.project-statuses.destroy');
    Route::post('settings/opus/task-statuses', [OpusSettingsController::class, 'storeTaskStatus'])->name('settings.opus.task-statuses.store');
    Route::put('settings/opus/task-statuses/{id}', [OpusSettingsController::class, 'updateTaskStatus'])->name('settings.opus.task-statuses.update');
    Route::delete('settings/opus/task-statuses/{id}', [OpusSettingsController::class, 'destroyTaskStatus'])->name('settings.opus.task-statuses.destroy');
    Route::post('settings/opus/task-priorities', [OpusSettingsController::class, 'storeTaskPriority'])->name('settings.opus.task-priorities.store');
    Route::put('settings/opus/task-priorities/{id}', [OpusSettingsController::class, 'updateTaskPriority'])->name('settings.opus.task-priorities.update');
    Route::delete('settings/opus/task-priorities/{id}', [OpusSettingsController::class, 'destroyTaskPriority'])->name('settings.opus.task-priorities.destroy');

    // Studium settings (Assignment Types)
    Route::get('settings/studium', [StudiumSettingsController::class, 'index'])->name('settings.studium');
    Route::post('settings/studium/assignment-types', [StudiumSettingsController::class, 'storeAssignmentType'])->name('settings.studium.assignment-types.store');
    Route::put('settings/studium/assignment-types/{id}', [StudiumSettingsController::class, 'updateAssignmentType'])->name('settings.studium.assignment-types.update');
    Route::delete('settings/studium/assignment-types/{id}', [StudiumSettingsController::class, 'destroyAssignmentType'])->name('settings.studium.assignment-types.destroy');

    // Vocatio settings (Job Statuses)
    Route::get('settings/vocatio', [VocatioSettingsController::class, 'index'])->name('settings.vocatio');
    Route::post('settings/vocatio/job-statuses', [VocatioSettingsController::class, 'storeJobStatus'])->name('settings.vocatio.job-statuses.store');
    Route::put('settings/vocatio/job-statuses/{id}', [VocatioSettingsController::class, 'updateJobStatus'])->name('settings.vocatio.job-statuses.update');
    Route::delete('settings/vocatio/job-statuses/{id}', [VocatioSettingsController::class, 'destroyJobStatus'])->name('settings.vocatio.job-statuses.destroy');

    // Google Calendar settings
    Route::get('settings/google-calendar', [GoogleCalendarController::class, 'index'])->name('settings.google-calendar');
    Route::put('settings/google-calendar', [GoogleCalendarController::class, 'update'])->name('settings.google-calendar.update');
});
