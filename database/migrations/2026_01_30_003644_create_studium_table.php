<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Assignment Types (Dinamis per user: tugas, kuis, uts, uas, proyek, dll)
        Schema::create('studium_assignment_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->index(); // 'tugas', 'kuis', 'uts', 'uas', 'proyek'
            $table->string('name'); // "Tugas", "Kuis", "UTS", "UAS", "Proyek"
            $table->string('color')->default('#64748b');
            $table->integer('order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 2. Programs (Misal: "S2 MBA Unpar", "Kursus Bahasa Jerman")
        Schema::create('studium_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // "MBA - Manajemen Bisnis"
            $table->string('institution')->nullable(); // "Univ. Parahyangan"
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable(); // Estimasi lulus
            $table->timestamps();
        });

        // 3. Semesters (Wadah mata kuliah per periode)
        Schema::create('studium_semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('studium_programs')->cascadeOnDelete();
            $table->string('name'); // "Semester 1", "Semester Pendek"
            $table->boolean('is_active')->default(false); // Penanda semester aktif
            $table->timestamps();
        });

        // 4. Courses (Mata Kuliah)
        Schema::create('studium_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained('studium_semesters')->cascadeOnDelete();
            $table->string('name'); // "Manajemen Strategis"
            $table->string('code')->nullable(); // "MGT-504"
            $table->integer('credits')->default(3); // SKS

            // Simpan jadwal di JSON biar fleksibel.
            // Contoh isi: { "day": "Monday", "start": "19:00", "end": "21:30", "room": "B201" }
            $table->json('schedule_data')->nullable();

            $table->string('lecturer_name')->nullable();
            $table->string('lecturer_contact')->nullable();
            $table->timestamps();
        });

        // 5. Assignments (Tugas, UTS, UAS)
        Schema::create('studium_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('studium_courses')->cascadeOnDelete();
            $table->string('title'); // "Makalah Kelompok 1"
            $table->foreignId('type_id')->nullable()->constrained('studium_assignment_types')->nullOnDelete();

            $table->dateTime('deadline')->nullable();
            $table->decimal('grade', 5, 2)->nullable(); // Nilai (0-100)

            // ID event Google Calendar untuk sinkronisasi
            $table->string('gcal_event_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studium_assignments');
        Schema::dropIfExists('studium_courses');
        Schema::dropIfExists('studium_semesters');
        Schema::dropIfExists('studium_programs');
        Schema::dropIfExists('studium_assignment_types');
    }
};
