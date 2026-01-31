<?php

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('authenticated users can view the feedback page', function () {
    $response = $this->actingAs($this->user)->get(route('settings.feedback'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('settings/feedback'));
});

test('authenticated users can see their own feedback history', function () {
    $feedback = Feedback::create([
        'user_id' => $this->user->id,
        'type' => 'bug_report',
        'subject' => 'Test Bug Report',
        'message' => 'This is a test bug report message.',
    ]);

    $response = $this->actingAs($this->user)->get(route('settings.feedback'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/feedback')
        ->has('feedbacks', 1)
        ->where('feedbacks.0.subject', 'Test Bug Report')
    );
});

test('authenticated users can submit feedback', function () {
    Mail::fake();

    $response = $this->actingAs($this->user)->post(route('settings.feedback.store'), [
        'type' => 'feature_request',
        'subject' => 'New Feature Request',
        'message' => 'I would like to request a new feature that does something cool.',
    ]);

    $response->assertRedirect(route('settings.feedback'));
    $response->assertSessionHas('status');

    $this->assertDatabaseHas('feedbacks', [
        'user_id' => $this->user->id,
        'type' => 'feature_request',
        'subject' => 'New Feature Request',
    ]);
});

test('feedback requires all required fields', function () {
    $response = $this->actingAs($this->user)->post(route('settings.feedback.store'), []);

    $response->assertSessionHasErrors(['type', 'subject', 'message']);
});

test('feedback message must be at least 10 characters', function () {
    $response = $this->actingAs($this->user)->post(route('settings.feedback.store'), [
        'type' => 'general',
        'subject' => 'Test Subject',
        'message' => 'Short',
    ]);

    $response->assertSessionHasErrors(['message']);
});

test('feedback type must be valid', function () {
    $response = $this->actingAs($this->user)->post(route('settings.feedback.store'), [
        'type' => 'invalid_type',
        'subject' => 'Test Subject',
        'message' => 'This is a valid message with more than 10 characters.',
    ]);

    $response->assertSessionHasErrors(['type']);
});

test('users can only see their own feedbacks', function () {
    $otherUser = User::factory()->create();

    Feedback::create([
        'user_id' => $this->user->id,
        'type' => 'general',
        'subject' => 'User 1 Feedback',
        'message' => 'This is feedback from user 1.',
    ]);

    Feedback::create([
        'user_id' => $otherUser->id,
        'type' => 'bug_report',
        'subject' => 'User 2 Feedback',
        'message' => 'This is feedback from user 2.',
    ]);

    $response = $this->actingAs($this->user)->get(route('settings.feedback'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('feedbacks', 1)
        ->where('feedbacks.0.subject', 'User 1 Feedback')
    );
});
