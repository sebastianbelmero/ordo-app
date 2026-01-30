<?php

use App\Models\User;
use App\Models\Vocatio\JobStatus;
use App\Models\Vocatio\Pipeline;

it('can load job create page with pipeline data', function () {
    $user = User::factory()->create();
    $pipeline = Pipeline::create([
        'user_id' => $user->id,
        'name' => 'Test Pipeline',
        'is_default' => true,
    ]);
    JobStatus::create([
        'user_id' => $user->id,
        'slug' => 'wishlist',
        'name' => 'Wishlist',
        'color' => '#6b7280',
        'order' => 1,
        'is_system' => true,
        'is_final' => false,
    ]);

    $response = $this->actingAs($user)
        ->get("/vocatio/pipelines/{$pipeline->id}/jobs/create");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Vocatio/Jobs/Create')
        ->has('pipeline')
        ->has('statuses')
        ->where('pipeline.id', $pipeline->id)
        ->where('pipeline.name', 'Test Pipeline')
    );
});

it('can store a new job', function () {
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

    $response = $this->actingAs($user)
        ->post("/vocatio/pipelines/{$pipeline->id}/jobs", [
            'status_id' => $status->id,
            'company' => 'Acme Corp',
            'position' => 'Software Engineer',
            'location' => 'Remote',
            'salary_min' => 50000,
            'salary_max' => 80000,
            'job_url' => 'https://acme.com/jobs/123',
            'description' => 'A great job opportunity',
            'notes' => 'Applied via LinkedIn',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('vocatio_jobs', [
        'user_id' => $user->id,
        'pipeline_id' => $pipeline->id,
        'status_id' => $status->id,
        'company' => 'Acme Corp',
        'position' => 'Software Engineer',
    ]);
});