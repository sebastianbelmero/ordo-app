<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Project Statuses (Dinamis per user: active, archived, hold, dll)
        Schema::create('opus_project_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->index(); // 'active', 'archived', 'hold'
            $table->string('name'); // "Active", "Archived", "On Hold"
            $table->string('color')->default('#64748b');
            $table->integer('order')->default(0); // Urutan tampilan
            $table->boolean('is_system')->default(false); // Default system, tidak bisa dihapus
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 2. Task Statuses (Dinamis per user: todo, in_progress, review, done, dll)
        Schema::create('opus_task_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->index(); // 'todo', 'in_progress', 'review', 'done'
            $table->string('name'); // "To Do", "In Progress", "Review", "Done"
            $table->string('color')->default('#64748b');
            $table->integer('order')->default(0); // Urutan kolom Kanban
            $table->boolean('is_system')->default(false);
            $table->boolean('is_completed')->default(false); // Penanda status selesai
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 3. Task Priorities (Dinamis per user: low, medium, high, urgent, dll)
        Schema::create('opus_task_priorities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->index(); // 'low', 'medium', 'high'
            $table->string('name'); // "Low", "Medium", "High"
            $table->string('color')->default('#64748b');
            $table->integer('level')->default(0); // Level prioritas (semakin tinggi = semakin penting)
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 4. Workspaces (Wadah besar: "Kantor", "Freelance", "Pribadi")
        Schema::create('opus_workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('color')->default('#64748b');
            $table->timestamps();
        });

        // 5. Projects (Isi workspace: "Website PT A", "Redesign App")
        Schema::create('opus_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('opus_workspaces')->cascadeOnDelete();
            $table->string('name');
            $table->foreignId('status_id')->nullable()->constrained('opus_project_statuses')->nullOnDelete();
            $table->timestamps();
        });

        // 6. Tasks (Kanban cards)
        Schema::create('opus_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('opus_projects')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();

            // Relasi ke status dan priority dinamis
            $table->foreignId('status_id')->nullable()->constrained('opus_task_statuses')->nullOnDelete();
            $table->foreignId('priority_id')->nullable()->constrained('opus_task_priorities')->nullOnDelete();

            $table->dateTime('due_date')->nullable();

            // Kolom sakti JSON (bisa simpan tags, checklist, atau subtasks tanpa tabel tambahan)
            $table->json('meta')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opus_tasks');
        Schema::dropIfExists('opus_projects');
        Schema::dropIfExists('opus_workspaces');
        Schema::dropIfExists('opus_task_priorities');
        Schema::dropIfExists('opus_task_statuses');
        Schema::dropIfExists('opus_project_statuses');
    }
};
