<?php

use App\Models\Studium\Assignment;
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
    $course = Course::create([
        'semester_id' => $semester->id,
        'name' => 'Test Course',
        'code' => 'TC101',
        'credits' => 3,
    ]);
    $this->assignment = Assignment::create([
        'course_id' => $course->id,
        'title' => 'Test Assignment',
        'grade' => null,
    ]);
});

test('toggle complete marks assignment as completed', function () {
    $this->actingAs($this->user)
        ->patch("/studium/assignments/{$this->assignment->id}/toggle-complete")
        ->assertRedirect();

    $this->assignment->refresh();
    expect($this->assignment->grade)->toBe('100.00');
});

test('toggle complete marks completed assignment as pending', function () {
    $this->assignment->update(['grade' => 100]);

    $this->actingAs($this->user)
        ->patch("/studium/assignments/{$this->assignment->id}/toggle-complete")
        ->assertRedirect();

    $this->assignment->refresh();
    expect($this->assignment->grade)->toBeNull();
});
