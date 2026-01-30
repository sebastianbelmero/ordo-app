<?php

use App\Http\Controllers\Admin\ActivityLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes untuk admin panel. Hanya user dengan role 'admin' yang bisa akses.
|
*/

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Activity Logs
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('activity-logs/{activity}', [ActivityLogController::class, 'show'])->name('activity-logs.show');
});
