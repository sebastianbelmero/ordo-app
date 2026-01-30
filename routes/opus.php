<?php

use App\Http\Controllers\Opus\ProjectController;
use App\Http\Controllers\Opus\TaskController;
use App\Http\Controllers\Opus\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Opus Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul Opus (Project & Task Management).
|
| STRUKTUR URL:
| - /opus/workspaces                     - List workspaces
| - /opus/workspaces/{workspace}         - Show workspace
| - /opus/workspaces/{workspace}/projects - List projects in workspace
| - /opus/projects/{project}             - Show project
| - /opus/projects/{project}/board       - Kanban board
| - /opus/projects/{project}/tasks       - List tasks in project
| - /opus/tasks/{task}                   - Show task
|
*/

Route::middleware(['auth'])->prefix('opus')->name('opus.')->group(function () {
    // Workspaces
    Route::get('workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');
    Route::get('workspaces/create', [WorkspaceController::class, 'create'])->name('workspaces.create');
    Route::post('workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
    Route::get('workspaces/{workspace}', [WorkspaceController::class, 'show'])->name('workspaces.show');
    Route::get('workspaces/{workspace}/edit', [WorkspaceController::class, 'edit'])->name('workspaces.edit');
    Route::put('workspaces/{workspace}', [WorkspaceController::class, 'update'])->name('workspaces.update');
    Route::delete('workspaces/{workspace}', [WorkspaceController::class, 'destroy'])->name('workspaces.destroy');

    // Projects (nested under workspace for listing)
    Route::get('workspaces/{workspace}/projects', [ProjectController::class, 'index'])->name('workspaces.projects.index');
    Route::get('workspaces/{workspace}/projects/create', [ProjectController::class, 'create'])->name('workspaces.projects.create');
    Route::post('workspaces/{workspace}/projects', [ProjectController::class, 'store'])->name('workspaces.projects.store');

    // Projects (direct access)
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('projects/{project}/board', [ProjectController::class, 'board'])->name('projects.board');
    Route::get('projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Tasks (nested under project for listing)
    Route::get('projects/{project}/tasks', [TaskController::class, 'index'])->name('projects.tasks.index');
    Route::get('projects/{project}/tasks/create', [TaskController::class, 'create'])->name('projects.tasks.create');
    Route::post('projects/{project}/tasks', [TaskController::class, 'store'])->name('projects.tasks.store');

    // Tasks (direct access)
    Route::get('tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::get('tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::patch('tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete'])->name('tasks.toggle-complete');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});
