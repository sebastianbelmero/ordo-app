<?php

use App\Http\Controllers\Studium\AssignmentController;
use App\Http\Controllers\Studium\CourseController;
use App\Http\Controllers\Studium\ProgramController;
use App\Http\Controllers\Studium\SemesterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Studium Routes
|--------------------------------------------------------------------------
|
| Routes untuk modul Studium (Academic Management).
|
| STRUKTUR URL:
| - /studium/programs                           - List programs
| - /studium/programs/{program}                 - Show program
| - /studium/programs/{program}/overview        - Program overview (full hierarchy)
| - /studium/programs/{program}/semesters       - List semesters
| - /studium/semesters/{semester}               - Show semester
| - /studium/semesters/{semester}/courses       - List courses
| - /studium/courses/{course}                   - Show course
| - /studium/courses/{course}/assignments       - List assignments
| - /studium/assignments/{assignment}           - Show assignment
| - /studium/assignments/upcoming               - Upcoming assignments
|
*/

Route::middleware(['auth'])->prefix('studium')->name('studium.')->group(function () {
    // Programs
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');
    Route::get('programs/create', [ProgramController::class, 'create'])->name('programs.create');
    Route::post('programs', [ProgramController::class, 'store'])->name('programs.store');
    Route::get('programs/{program}', [ProgramController::class, 'show'])->name('programs.show');
    Route::get('programs/{program}/overview', [ProgramController::class, 'overview'])->name('programs.overview');
    Route::get('programs/{program}/edit', [ProgramController::class, 'edit'])->name('programs.edit');
    Route::put('programs/{program}', [ProgramController::class, 'update'])->name('programs.update');
    Route::delete('programs/{program}', [ProgramController::class, 'destroy'])->name('programs.destroy');

    // Semesters (nested under program for listing)
    Route::get('programs/{program}/semesters', [SemesterController::class, 'index'])->name('programs.semesters.index');
    Route::get('programs/{program}/semesters/create', [SemesterController::class, 'create'])->name('programs.semesters.create');
    Route::post('programs/{program}/semesters', [SemesterController::class, 'store'])->name('programs.semesters.store');

    // Semesters (direct access)
    Route::get('semesters/{semester}', [SemesterController::class, 'show'])->name('semesters.show');
    Route::get('semesters/{semester}/edit', [SemesterController::class, 'edit'])->name('semesters.edit');
    Route::put('semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
    Route::delete('semesters/{semester}', [SemesterController::class, 'destroy'])->name('semesters.destroy');

    // Courses (nested under semester for listing)
    Route::get('semesters/{semester}/courses', [CourseController::class, 'index'])->name('semesters.courses.index');
    Route::get('semesters/{semester}/courses/create', [CourseController::class, 'create'])->name('semesters.courses.create');
    Route::post('semesters/{semester}/courses', [CourseController::class, 'store'])->name('semesters.courses.store');

    // Courses (direct access)
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
    Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

    // Assignments (nested under course for listing)
    Route::get('courses/{course}/assignments', [AssignmentController::class, 'index'])->name('courses.assignments.index');
    Route::get('courses/{course}/assignments/create', [AssignmentController::class, 'create'])->name('courses.assignments.create');
    Route::post('courses/{course}/assignments', [AssignmentController::class, 'store'])->name('courses.assignments.store');

    // Assignments (direct access) - Upcoming harus sebelum {assignment}
    Route::get('assignments/upcoming', [AssignmentController::class, 'upcoming'])->name('assignments.upcoming');
    Route::get('assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::get('assignments/{assignment}/edit', [AssignmentController::class, 'edit'])->name('assignments.edit');
    Route::put('assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
    Route::patch('assignments/{assignment}/toggle-complete', [AssignmentController::class, 'toggleComplete'])->name('assignments.toggle-complete');
    Route::delete('assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
});
