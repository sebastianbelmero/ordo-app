<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Studium - Assignments (already has gcal_event_id, renaming for consistency)
        if (Schema::hasColumn('studium_assignments', 'gcal_event_id')) {
            Schema::table('studium_assignments', function (Blueprint $table) {
                $table->renameColumn('gcal_event_id', 'google_calendar_event_id');
            });
        } else {
            Schema::table('studium_assignments', function (Blueprint $table) {
                $table->string('google_calendar_event_id')->nullable()->after('grade');
            });
        }

        // Opus - Tasks
        Schema::table('opus_tasks', function (Blueprint $table) {
            $table->string('google_calendar_event_id')->nullable()->after('meta');
        });

        // Vocatio - Jobs
        Schema::table('vocatio_jobs', function (Blueprint $table) {
            $table->string('google_calendar_event_id')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename back for assignments
        if (Schema::hasColumn('studium_assignments', 'google_calendar_event_id')) {
            Schema::table('studium_assignments', function (Blueprint $table) {
                $table->renameColumn('google_calendar_event_id', 'gcal_event_id');
            });
        }

        Schema::table('opus_tasks', function (Blueprint $table) {
            $table->dropColumn('google_calendar_event_id');
        });

        Schema::table('vocatio_jobs', function (Blueprint $table) {
            $table->dropColumn('google_calendar_event_id');
        });
    }
};
