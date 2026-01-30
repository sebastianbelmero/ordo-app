<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FriendController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Authentication Routes (Google OAuth Only)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('login', fn () => Inertia::render('auth/login'))->name('login');
    Route::get('auth/google', [SocialiteController::class, 'redirect'])->name('auth.google');
    Route::get('auth/google/callback', [SocialiteController::class, 'callback'])->name('auth.google.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [SocialiteController::class, 'logout'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/
Route::get('dashboard', DashboardController::class)
    ->middleware(['auth'])
    ->name('dashboard');

/*
|--------------------------------------------------------------------------
| Friends
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('friends')->name('friends.')->group(function () {
    Route::get('/', [FriendController::class, 'index'])->name('index');
    Route::get('/add', [FriendController::class, 'create'])->name('create');
    Route::post('/', [FriendController::class, 'store'])->name('store');
    Route::patch('/{friendship}/respond', [FriendController::class, 'respond'])->name('respond');
    Route::delete('/{friendship}', [FriendController::class, 'destroy'])->name('destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/opus.php';
require __DIR__.'/studium.php';
require __DIR__.'/vocatio.php';
require __DIR__.'/admin.php';
