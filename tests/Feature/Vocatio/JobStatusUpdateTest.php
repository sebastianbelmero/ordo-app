<?php

use App\Models\User;
use App\Models\Vocatio\Job;
use App\Models\Vocatio\JobStatus;
use App\Models\Vocatio\Pipeline;

it('can update job status via patch request (for drag & drop)', function () {
    $user = User::factory()->create();
    $pipeline = Pipeline::create([
        'user_id' => $user->id,
        'name' => 'Test Pipeline',
        'is_default' => true,
    ]);
    $wishlistStatus = JobStatus::create([
        'user_id' => $user->id,
        'slug' => 'wishlist',
        'name' => 'Wishlist',
        'color' => '#6b7280',
        'order' => 1,
        'is_system' => true,
        'is_final' => false,
    ]);
    $appliedStatus = JobStatus::create([
        'user_id' => $user->id,
        'slug' => 'applied',
        'name' => 'Applied',
        'color' => '#22c55e',
        'order' => 2,
        'is_system' => true,
        'is_final' => false,
    ]);
    $job = Job::create([
        'user_id' => $user->id,
        'pipeline_id' => $pipeline->id,
        'status_id' => $wishlistStatus->id,
        'company' => 'Test Company',
        'position' => 'Developer',
    ]);

    $response = $this->actingAs($user)
        ->patch("/vocatio/jobs/{$job->id}/status", [
            'status_id' => $appliedStatus->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vocatio_jobs', [
        'id' => $job->id,
        'status_id' => $appliedStatus->id,
    ]);
});

it('can load board page with jobs grouped by status', function () {
    $user = User::factory()->create();
    $pipeline = Pipeline::create([
        'user_id' => $user->id,
        'name' => 'Test Pipeline',
        'is_default' => true,
    ]);
    $status = JobStatus::create([
        'user_id' => $user->id,
        'slug' => 'wishlist',
        'name' => 'Wishlist',
        'color' => '#6b7280',
        'order' => 1,
        'is_system' => true,
        'is_final' => false,
    ]);
    Job::create([
        'user_id' => $user->id,
        'pipeline_id' => $pipeline->id,
        'status_id' => $status->id,
        'company' => 'Test Company',
        'position' => 'Developer',
    ]);

    $response = $this->actingAs($user)
        ->get("/vocatio/pipelines/{$pipeline->id}/board");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Vocatio/Pipelines/Board')
        ->has('pipeline')
        ->has('board')
    );
});