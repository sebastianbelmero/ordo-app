<?php

use App\Models\Studium\Course;
use App\Models\Studium\Program;
use App\Models\Studium\Semester;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $program = Program::create([
        'user_id' => $this->user->id,
        'name' => 'Test Program',
    ]);
    $semester = Semester::create([
        'program_id' => $program->id,
        'name' => 'Test Semester',
    ]);
    $this->course = Course::create([
        'semester_id' => $semester->id,
        'name' => 'Original Course',
        'code' => 'OC101',
        'credits' => 3,
    ]);
});

test('can update course name', function () {
    $this->actingAs($this->user)
        ->put("/studium/courses/{$this->course->id}", [
            'name' => 'Updated Course',
            'code' => 'UC101',
            'credits' => 4,
        ])
        ->assertRedirect();

    $this->course->refresh();
    expect($this->course->name)->toBe('Updated Course');
    expect($this->course->code)->toBe('UC101');
    expect($this->course->credits)->toBe(4);
});

test('can update lecturer info', function () {
    $this->actingAs($this->user)
        ->put("/studium/courses/{$this->course->id}", [
            'name' => 'Original Course',
            'lecturer_name' => 'Dr. John',
            'lecturer_contact' => 'john@univ.edu',
        ])
        ->assertRedirect();

    $this->course->refresh();
    expect($this->course->lecturer_name)->toBe('Dr. John');
    expect($this->course->lecturer_contact)->toBe('john@univ.edu');
});
