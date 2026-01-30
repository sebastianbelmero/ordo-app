<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
});

it('prevents guests from accessing activity logs', function () {
    $response = $this->get(route('admin.activity-logs.index'));

    $response->assertRedirect(route('login'));
});

it('prevents non-admin users from accessing activity logs', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $response = $this->actingAs($user)->get(route('admin.activity-logs.index'));

    $response->assertForbidden();
});

it('allows admin to view activity logs index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    // Create some activity logs
    activity()
        ->causedBy($admin)
        ->log('Test activity');

    $response = $this->actingAs($admin)->get(route('admin.activity-logs.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/ActivityLogs/Index')
        ->has('activities.data'));
});

it('allows admin to view a single activity log', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $activity = activity()
        ->causedBy($admin)
        ->withProperties(['key' => 'value'])
        ->log('Test activity');

    $response = $this->actingAs($admin)->get(route('admin.activity-logs.show', $activity));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/ActivityLogs/Show')
        ->has('activity')
        ->where('activity.id', $activity->id));
});

it('can filter activity logs by log name', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    activity()->useLog('auth')->log('Auth activity');
    activity()->useLog('default')->log('Default activity');

    $response = $this->actingAs($admin)->get(route('admin.activity-logs.index', ['log_name' => 'auth']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/ActivityLogs/Index')
        ->where('activities.data.0.log_name', 'auth'));
});

it('can search activity logs by description', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    activity()->log('User logged in');
    activity()->log('User logged out');

    $response = $this->actingAs($admin)->get(route('admin.activity-logs.index', ['search' => 'logged in']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/ActivityLogs/Index')
        ->has('activities.data', 1));
});
