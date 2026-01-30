<?php

use App\Models\User;
use App\Models\Vocatio\Job;
use App\Models\Vocatio\JobStatus;
use App\Models\Vocatio\Pipeline;

it('can load job edit page with pipeline relation', function () {
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
    $job = Job::create([
        'user_id' => $user->id,
        'pipeline_id' => $pipeline->id,
        'status_id' => $status->id,
        'company' => 'Test Company',
        'position' => 'Developer',
    ]);

    $response = $this->actingAs($user)
        ->get("/vocatio/jobs/{$job->id}/edit");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Vocatio/Jobs/Edit')
        ->has('job')
        ->has('statuses')
        ->where('job.id', $job->id)
        ->where('job.pipeline.id', $pipeline->id)
        ->where('job.pipeline.name', 'Test Pipeline')
    );
});

it('can update a job', function () {
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
        'status_id' => $status->id,
        'company' => 'Test Company',
        'position' => 'Developer',
    ]);

    $response = $this->actingAs($user)
        ->put("/vocatio/jobs/{$job->id}", [
            'status_id' => $appliedStatus->id,
            'company' => 'Updated Company',
            'position' => 'Senior Developer',
            'location' => 'Remote',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vocatio_jobs', [
        'id' => $job->id,
        'status_id' => $appliedStatus->id,
        'company' => 'Updated Company',
        'position' => 'Senior Developer',
        'location' => 'Remote',
    ]);
});