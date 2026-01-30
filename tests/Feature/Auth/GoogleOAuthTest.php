<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
});

it('redirects to Google OAuth', function () {
    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
    expect($response->getTargetUrl())->toContain('accounts.google.com');
});

it('shows login page with Google button', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('auth/login'));
});

it('creates a new user on first Google login', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('12345');
    $socialiteUser->shouldReceive('getName')->andReturn('Test User');
    $socialiteUser->shouldReceive('getEmail')->andReturn('testuser@example.com');
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    expect(User::count())->toBe(0);

    $response = $this->get(route('auth.google.callback'));

    expect(User::count())->toBe(1);

    $user = User::first();
    expect($user->google_id)->toBe('12345');
    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('testuser@example.com');
    expect($user->avatar)->toBe('https://example.com/avatar.jpg');
    expect($user->hasRole('user'))->toBeTrue();

    $response->assertRedirect('/dashboard');
});

it('logs in existing user on Google login', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'google_id' => '54321',
    ]);

    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('54321');
    $socialiteUser->shouldReceive('getName')->andReturn('Existing User');
    $socialiteUser->shouldReceive('getEmail')->andReturn('existing@example.com');
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/new-avatar.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    expect(User::count())->toBe(1);

    $response = $this->get(route('auth.google.callback'));

    expect(User::count())->toBe(1);

    $existingUser->refresh();
    expect($existingUser->avatar)->toBe('https://example.com/new-avatar.jpg');

    $response->assertRedirect('/dashboard');
});

it('assigns admin role to admin email', function () {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn('admin123');
    $socialiteUser->shouldReceive('getName')->andReturn('Admin User');
    $socialiteUser->shouldReceive('getEmail')->andReturn('sebastianbelmerositorus@gmail.com');
    $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/admin-avatar.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

    $response = $this->get(route('auth.google.callback'));

    $user = User::first();
    expect($user->hasRole('admin'))->toBeTrue();
});

it('can logout authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect('/');
    $this->assertGuest();
});

it('redirects guests to login', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect(route('login'));
});
