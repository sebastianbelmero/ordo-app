<?php

use App\Models\User;
use App\Models\Opus\Project;
use App\Models\Opus\ProjectStatus;
use App\Models\Opus\Task;
use App\Models\Opus\TaskStatus;
use App\Models\Opus\TaskPriority;
use App\Models\Opus\Workspace;

it('can update task status via patch request (for drag & drop)', function () {
    $user = User::factory()->create();
    
    // Create workspace
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test Workspace',
    ]);
    
    // Create project status
    $projectStatus = ProjectStatus::create([
        'user_id' => $user->id,
        'slug' => 'active',
        'name' => 'Active',
        'color' => '#22c55e',
        'order' => 1,
        'is_system' => true,
    ]);
    
    // Create project
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Project',
        'status_id' => $projectStatus->id,
    ]);
    
    // Create task statuses
    $todoStatus = TaskStatus::create([
        'user_id' => $user->id,
        'slug' => 'todo',
        'name' => 'To Do',
        'color' => '#6b7280',
        'order' => 1,
        'is_system' => true,
        'is_completed' => false,
    ]);
    $inProgressStatus = TaskStatus::create([
        'user_id' => $user->id,
        'slug' => 'in-progress',
        'name' => 'In Progress',
        'color' => '#eab308',
        'order' => 2,
        'is_system' => true,
        'is_completed' => false,
    ]);
    
    // Create task priority
    $priority = TaskPriority::create([
        'user_id' => $user->id,
        'slug' => 'medium',
        'name' => 'Medium',
        'color' => '#eab308',
        'level' => 2,
        'is_system' => true,
    ]);
    
    // Create task
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'Test Task',
        'status_id' => $todoStatus->id,
        'priority_id' => $priority->id,
    ]);

    $response = $this->actingAs($user)
        ->patch("/opus/tasks/{$task->id}/status", [
            'status_id' => $inProgressStatus->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('opus_tasks', [
        'id' => $task->id,
        'status_id' => $inProgressStatus->id,
    ]);
});

it('can load board page with tasks grouped by status', function () {
    $user = User::factory()->create();
    
    // Create workspace
    $workspace = Workspace::create([
        'user_id' => $user->id,
        'name' => 'Test Workspace',
    ]);
    
    // Create project status
    $projectStatus = ProjectStatus::create([
        'user_id' => $user->id,
        'slug' => 'active',
        'name' => 'Active',
        'color' => '#22c55e',
        'order' => 1,
        'is_system' => true,
    ]);
    
    // Create project
    $project = Project::create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Project',
        'status_id' => $projectStatus->id,
    ]);
    
    // Create task status
    $todoStatus = TaskStatus::create([
        'user_id' => $user->id,
        'slug' => 'todo',
        'name' => 'To Do',
        'color' => '#6b7280',
        'order' => 1,
        'is_system' => true,
        'is_completed' => false,
    ]);
    
    // Create task priority
    $priority = TaskPriority::create([
        'user_id' => $user->id,
        'slug' => 'medium',
        'name' => 'Medium',
        'color' => '#eab308',
        'level' => 2,
        'is_system' => true,
    ]);
    
    // Create task
    Task::create([
        'project_id' => $project->id,
        'title' => 'Test Task',
        'status_id' => $todoStatus->id,
        'priority_id' => $priority->id,
    ]);

    $response = $this->actingAs($user)
        ->get("/opus/projects/{$project->id}/board");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Opus/Projects/Board')
        ->has('project')
        ->has('board')
    );
});