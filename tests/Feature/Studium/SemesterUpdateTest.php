<?php

use App\Models\Studium\Program;
use App\Models\Studium\Semester;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $program = Program::create([
        'user_id' => $this->user->id,
        'name' => 'Test Program',
    ]);
    $this->semester = Semester::create([
        'program_id' => $program->id,
        'name' => 'Original Name',
        'is_active' => false,
    ]);
});

test('can update semester name', function () {
    $this->actingAs($this->user)
        ->put("/studium/semesters/{$this->semester->id}", [
            'name' => 'Updated Name',
            'is_active' => false,
        ])
        ->assertRedirect();

    $this->semester->refresh();
    expect($this->semester->name)->toBe('Updated Name');
});

test('can toggle semester active status', function () {
    $this->actingAs($this->user)
        ->put("/studium/semesters/{$this->semester->id}", [
            'name' => 'Original Name',
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->semester->refresh();
    expect($this->semester->is_active)->toBeTrue();
});
