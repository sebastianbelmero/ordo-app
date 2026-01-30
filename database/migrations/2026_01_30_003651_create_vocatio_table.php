<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Job Statuses (Dinamis per user: saved, applied, interview, offer, rejected, dll)
        Schema::create('vocatio_job_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->index(); // 'saved', 'applied', 'interview', 'offer', 'rejected'
            $table->string('name'); // "Saved", "Applied", "Interview", "Offer", "Rejected"
            $table->string('color')->default('#64748b');
            $table->integer('order')->default(0); // Urutan kolom Kanban
            $table->boolean('is_system')->default(false);
            $table->boolean('is_final')->default(false); // Penanda status akhir (offer/rejected)
            $table->timestamps();

            $table->unique(['user_id', 'slug']);
        });

        // 2. Pipelines (Wadah Loker: "Loker IT 2026", "Loker MT")
        Schema::create('vocatio_pipelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // 3. Jobs (Kartu Lamaran)
        Schema::create('vocatio_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('company');
            $table->string('position');
            $table->text('url')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->integer('level_of_interest')->default(1);
            $table->decimal('salary_min', 15, 2)->nullable();
            $table->decimal('salary_max', 15, 2)->nullable();

            // Relasi User
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Relasi ke Status (dinamis per user)
            $table->foreignId('status_id')->nullable()->constrained('vocatio_job_statuses')->nullOnDelete();

            // Relasi ke Pipeline
            $table->foreignId('pipeline_id')->nullable()->constrained('vocatio_pipelines')->cascadeOnDelete();

            $table->timestamps();
        });

        // 4. Job Shares (Fitur Share ke teman - status tetap enum karena ini system-level)
        Schema::create('vocatio_job_shares', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->text('message')->nullable();
            $table->string('status')->default('pending'); // 'pending', 'accepted', 'declined'

            $table->foreignUuid('job_id')->constrained('vocatio_jobs')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vocatio_job_shares');
        Schema::dropIfExists('vocatio_jobs');
        Schema::dropIfExists('vocatio_pipelines');
        Schema::dropIfExists('vocatio_job_statuses');
    }
};
