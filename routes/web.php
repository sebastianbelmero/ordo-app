<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\Settings\GoogleCalendarController;
use App\Http\Controllers\TelegramWebhookController;
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

/*
|--------------------------------------------------------------------------
| Calendar
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('calendar')->name('calendar.')->group(function () {
    Route::get('/', [CalendarController::class, 'index'])->name('index');
    Route::get('/events', [CalendarController::class, 'events'])->name('events');
    Route::post('/events', [CalendarController::class, 'store'])->name('events.store');
    Route::put('/events/{eventId}', [CalendarController::class, 'update'])->name('events.update');
    Route::delete('/events/{eventId}', [CalendarController::class, 'destroy'])->name('events.destroy');
});

/*
|--------------------------------------------------------------------------
| Google Calendar OAuth
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('google-calendar')->name('google-calendar.')->group(function () {
    Route::get('/connect', [GoogleCalendarController::class, 'connect'])->name('connect');
    Route::get('/callback', [GoogleCalendarController::class, 'callback'])->name('callback');
    Route::post('/disconnect', [GoogleCalendarController::class, 'disconnect'])->name('disconnect');
});

Route::post('/settings/telegram/generate-code', [TelegramWebhookController::class, 'generateAuthCode'])
    ->middleware(['auth']);

require __DIR__.'/settings.php';
require __DIR__.'/opus.php';
require __DIR__.'/studium.php';
require __DIR__.'/vocatio.php';
require __DIR__.'/admin.php';
