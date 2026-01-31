<?php

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
});

it('prevents non-admin users from accessing admin feedbacks', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $response = $this->actingAs($user)->get(route('admin.feedbacks.index'));

    $response->assertForbidden();
});

it('allows admin to view feedbacks index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    Feedback::create([
        'user_id' => $user->id,
        'type' => 'bug_report',
        'subject' => 'Test Bug',
        'message' => 'This is a test bug report.',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.feedbacks.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Feedbacks/Index')
        ->has('feedbacks.data', 1)
    );
});

it('allows admin to view a single feedback', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $feedback = Feedback::create([
        'user_id' => $user->id,
        'type' => 'feature_request',
        'subject' => 'New Feature',
        'message' => 'Please add this feature.',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.feedbacks.show', $feedback));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Feedbacks/Show')
        ->has('feedback')
        ->where('feedback.id', $feedback->id)
    );
});

it('allows admin to update feedback status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();
    $feedback = Feedback::create([
        'user_id' => $user->id,
        'type' => 'general',
        'subject' => 'General Feedback',
        'message' => 'This is general feedback.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.feedbacks.update-status', $feedback), [
        'status' => 'resolved',
        'admin_notes' => 'Issue has been fixed.',
    ]);

    $response->assertRedirect();

    $feedback->refresh();
    expect($feedback->status)->toBe('resolved');
    expect($feedback->admin_notes)->toBe('Issue has been fixed.');
});

it('can filter feedbacks by type', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();

    Feedback::create([
        'user_id' => $user->id,
        'type' => 'bug_report',
        'subject' => 'Bug Report',
        'message' => 'Found a bug.',
    ]);

    Feedback::create([
        'user_id' => $user->id,
        'type' => 'feature_request',
        'subject' => 'Feature Request',
        'message' => 'Need new feature.',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.feedbacks.index', ['type' => 'bug_report']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('feedbacks.data', 1)
        ->where('feedbacks.data.0.type', 'bug_report')
    );
});

it('can filter feedbacks by status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $user = User::factory()->create();

    Feedback::create([
        'user_id' => $user->id,
        'type' => 'general',
        'subject' => 'Pending Feedback',
        'message' => 'This is pending.',
        'status' => 'pending',
    ]);

    Feedback::create([
        'user_id' => $user->id,
        'type' => 'general',
        'subject' => 'Resolved Feedback',
        'message' => 'This is resolved.',
        'status' => 'resolved',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.feedbacks.index', ['status' => 'pending']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('feedbacks.data', 1)
        ->where('feedbacks.data.0.status', 'pending')
    );
});
