<?php

declare(strict_types=1);

namespace App\Support;

/**
 * ======================================================================================
 * DUMMY DATA UNTUK API DESIGN
 * ======================================================================================
 *
 * File ini berisi dummy data statis yang merepresentasikan data dari database.
 * Digunakan untuk keperluan design API sebelum data asli tersedia.
 *
 * Cara penggunaan:
 *   $dummyData = new DummyData();
 *   $users = $dummyData->users();
 *   $projects = $dummyData->opusProjects();
 *
 * ======================================================================================
 */
class DummyData
{
    // ==================================================================================
    // TIMESTAMPS HELPER
    // ==================================================================================
    private function timestamps(string $created = '2026-01-15 10:00:00', ?string $updated = null): array
    {
        return [
            'created_at' => $created,
            'updated_at' => $updated ?? $created,
        ];
    }

    // ==================================================================================
    // USERS TABLE
    // Tabel utama user dengan data profil dan autentikasi
    // Relasi: HasMany ke semua modul (opus, studium, vocatio)
    // ==================================================================================
    public function users(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'email_verified_at' => '2026-01-15 10:00:00',
                'password' => '$2y$12$hashed_password_here', // bcrypt hash
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
                'remember_token' => 'randomtoken123',
                ...$this->timestamps('2026-01-10 08:00:00'),
            ],
            [
                'id' => 2,
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'email_verified_at' => '2026-01-16 14:30:00',
                'password' => '$2y$12$hashed_password_here',
                'two_factor_secret' => 'encrypted_secret_here',
                'two_factor_recovery_codes' => json_encode(['code1', 'code2', 'code3', 'code4', 'code5', 'code6', 'code7', 'code8']),
                'two_factor_confirmed_at' => '2026-01-17 09:00:00',
                'remember_token' => null,
                ...$this->timestamps('2026-01-12 12:00:00', '2026-01-17 09:00:00'),
            ],
            [
                'id' => 3,
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad@example.com',
                'email_verified_at' => null, // Belum verifikasi email
                'password' => '$2y$12$hashed_password_here',
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
                'remember_token' => null,
                ...$this->timestamps('2026-01-20 16:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // PASSWORD RESET TOKENS TABLE
    // Menyimpan token untuk reset password
    // ==================================================================================
    public function passwordResetTokens(): array
    {
        return [
            [
                'email' => 'ahmad@example.com',
                'token' => '$2y$12$hashed_token_here',
                'created_at' => '2026-01-25 10:00:00',
            ],
        ];
    }

    // ==================================================================================
    // SESSIONS TABLE
    // Menyimpan session aktif user
    // ==================================================================================
    public function sessions(): array
    {
        return [
            [
                'id' => 'session_id_abc123xyz',
                'user_id' => 1,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'payload' => 'base64_encoded_session_data_here',
                'last_activity' => 1738234800, // Unix timestamp
            ],
            [
                'id' => 'session_id_def456uvw',
                'user_id' => 2,
                'ip_address' => '10.0.0.50',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'payload' => 'base64_encoded_session_data_here',
                'last_activity' => 1738230000,
            ],
        ];
    }

    // ==================================================================================
    // USER MODULES TABLE
    // Mengatur modul mana yang aktif untuk setiap user (opus, studium, vocatio)
    // Relasi: BelongsTo User
    // ==================================================================================
    public function userModules(): array
    {
        return [
            // User 1 - Semua modul aktif
            [
                'id' => 1,
                'user_id' => 1,
                'module' => 'opus',
                'is_enabled' => true,
                'order' => 1,
                'settings' => json_encode([
                    'default_view' => 'kanban',
                    'show_completed_tasks' => true,
                ]),
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'module' => 'studium',
                'is_enabled' => true,
                'order' => 2,
                'settings' => json_encode([
                    'default_view' => 'calendar',
                ]),
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'module' => 'vocatio',
                'is_enabled' => true,
                'order' => 3,
                'settings' => null,
                ...$this->timestamps(),
            ],

            // User 2 - Hanya opus dan vocatio
            [
                'id' => 4,
                'user_id' => 2,
                'module' => 'opus',
                'is_enabled' => true,
                'order' => 1,
                'settings' => json_encode([
                    'default_view' => 'list',
                ]),
                ...$this->timestamps(),
            ],
            [
                'id' => 5,
                'user_id' => 2,
                'module' => 'studium',
                'is_enabled' => false, // Dinonaktifkan
                'order' => 2,
                'settings' => null,
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 2,
                'module' => 'vocatio',
                'is_enabled' => true,
                'order' => 3,
                'settings' => json_encode([
                    'default_view' => 'board',
                ]),
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    //
    //  ██████╗ ██████╗ ██╗   ██╗███████╗    ███╗   ███╗ ██████╗ ██████╗ ██╗   ██╗██╗     ███████╗
    // ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ████╗ ████║██╔═══██╗██╔══██╗██║   ██║██║     ██╔════╝
    // ██║   ██║██████╔╝██║   ██║███████╗    ██╔████╔██║██║   ██║██║  ██║██║   ██║██║     █████╗
    // ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██║╚██╔╝██║██║   ██║██║  ██║██║   ██║██║     ██╔══╝
    // ╚██████╔╝██║     ╚██████╔╝███████║    ██║ ╚═╝ ██║╚██████╔╝██████╔╝╚██████╔╝███████╗███████╗
    //  ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
    //
    // Modul untuk manajemen proyek dan task (Kanban-style)
    // ==================================================================================

    // ==================================================================================
    // OPUS PROJECT STATUSES TABLE
    // Status dinamis untuk proyek (per user)
    // Relasi: BelongsTo User, HasMany OpusProject
    // ==================================================================================
    public function opusProjectStatuses(): array
    {
        return [
            // User 1 - Default statuses
            [
                'id' => 1,
                'user_id' => 1,
                'slug' => 'active',
                'name' => 'Active',
                'color' => '#22c55e', // green
                'order' => 1,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'slug' => 'on_hold',
                'name' => 'On Hold',
                'color' => '#f59e0b', // amber
                'order' => 2,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'slug' => 'archived',
                'name' => 'Archived',
                'color' => '#64748b', // slate
                'order' => 3,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'slug' => 'completed',
                'name' => 'Completed',
                'color' => '#3b82f6', // blue
                'order' => 4,
                'is_system' => false, // Custom status user
                ...$this->timestamps(),
            ],

            // User 2 - Default statuses
            [
                'id' => 5,
                'user_id' => 2,
                'slug' => 'active',
                'name' => 'Aktif',
                'color' => '#22c55e',
                'order' => 1,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 2,
                'slug' => 'archived',
                'name' => 'Diarsipkan',
                'color' => '#64748b',
                'order' => 2,
                'is_system' => true,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // OPUS TASK STATUSES TABLE
    // Status dinamis untuk task/kanban column (per user)
    // Relasi: BelongsTo User, HasMany OpusTask
    // ==================================================================================
    public function opusTaskStatuses(): array
    {
        return [
            // User 1 - Kanban columns
            [
                'id' => 1,
                'user_id' => 1,
                'slug' => 'todo',
                'name' => 'To Do',
                'color' => '#64748b',
                'order' => 1,
                'is_system' => true,
                'is_completed' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'slug' => 'in_progress',
                'name' => 'In Progress',
                'color' => '#3b82f6',
                'order' => 2,
                'is_system' => true,
                'is_completed' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'slug' => 'review',
                'name' => 'Review',
                'color' => '#f59e0b',
                'order' => 3,
                'is_system' => false,
                'is_completed' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'slug' => 'done',
                'name' => 'Done',
                'color' => '#22c55e',
                'order' => 4,
                'is_system' => true,
                'is_completed' => true, // Penanda task selesai
                ...$this->timestamps(),
            ],

            // User 2 - Simplified columns
            [
                'id' => 5,
                'user_id' => 2,
                'slug' => 'backlog',
                'name' => 'Backlog',
                'color' => '#64748b',
                'order' => 1,
                'is_system' => true,
                'is_completed' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 2,
                'slug' => 'doing',
                'name' => 'Sedang Dikerjakan',
                'color' => '#8b5cf6',
                'order' => 2,
                'is_system' => true,
                'is_completed' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 7,
                'user_id' => 2,
                'slug' => 'done',
                'name' => 'Selesai',
                'color' => '#22c55e',
                'order' => 3,
                'is_system' => true,
                'is_completed' => true,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // OPUS TASK PRIORITIES TABLE
    // Prioritas dinamis untuk task (per user)
    // Relasi: BelongsTo User, HasMany OpusTask
    // ==================================================================================
    public function opusTaskPriorities(): array
    {
        return [
            // User 1
            [
                'id' => 1,
                'user_id' => 1,
                'slug' => 'low',
                'name' => 'Low',
                'color' => '#64748b',
                'level' => 1,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'slug' => 'medium',
                'name' => 'Medium',
                'color' => '#f59e0b',
                'level' => 2,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'slug' => 'high',
                'name' => 'High',
                'color' => '#ef4444',
                'level' => 3,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'slug' => 'urgent',
                'name' => 'Urgent',
                'color' => '#dc2626',
                'level' => 4,
                'is_system' => false, // Custom priority
                ...$this->timestamps(),
            ],

            // User 2
            [
                'id' => 5,
                'user_id' => 2,
                'slug' => 'rendah',
                'name' => 'Rendah',
                'color' => '#22c55e',
                'level' => 1,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 2,
                'slug' => 'tinggi',
                'name' => 'Tinggi',
                'color' => '#ef4444',
                'level' => 2,
                'is_system' => true,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // OPUS WORKSPACES TABLE
    // Wadah besar untuk proyek (contoh: "Kantor", "Freelance", "Pribadi")
    // Relasi: BelongsTo User, HasMany OpusProject
    // ==================================================================================
    public function opusWorkspaces(): array
    {
        return [
            // User 1
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'Kantor',
                'slug' => 'kantor',
                'color' => '#3b82f6',
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'Freelance',
                'slug' => 'freelance',
                'color' => '#8b5cf6',
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'name' => 'Personal Projects',
                'slug' => 'personal-projects',
                'color' => '#22c55e',
                ...$this->timestamps(),
            ],

            // User 2
            [
                'id' => 4,
                'user_id' => 2,
                'name' => 'Pekerjaan',
                'slug' => 'pekerjaan',
                'color' => '#f59e0b',
                ...$this->timestamps(),
            ],
            [
                'id' => 5,
                'user_id' => 2,
                'name' => 'Side Hustle',
                'slug' => 'side-hustle',
                'color' => '#ec4899',
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // OPUS PROJECTS TABLE
    // Proyek dalam workspace
    // Relasi: BelongsTo OpusWorkspace, BelongsTo OpusProjectStatus, HasMany OpusTask
    // ==================================================================================
    public function opusProjects(): array
    {
        return [
            // Workspace 1 (Kantor - User 1)
            [
                'id' => 1,
                'workspace_id' => 1,
                'name' => 'Website Redesign PT ABC',
                'status_id' => 1, // Active
                ...$this->timestamps('2026-01-05 09:00:00'),
            ],
            [
                'id' => 2,
                'workspace_id' => 1,
                'name' => 'Mobile App Development',
                'status_id' => 1, // Active
                ...$this->timestamps('2026-01-08 10:30:00'),
            ],
            [
                'id' => 3,
                'workspace_id' => 1,
                'name' => 'Legacy System Migration',
                'status_id' => 2, // On Hold
                ...$this->timestamps('2025-12-01 08:00:00'),
            ],

            // Workspace 2 (Freelance - User 1)
            [
                'id' => 4,
                'workspace_id' => 2,
                'name' => 'E-commerce Toko Baju',
                'status_id' => 1, // Active
                ...$this->timestamps('2026-01-15 14:00:00'),
            ],
            [
                'id' => 5,
                'workspace_id' => 2,
                'name' => 'Landing Page Startup XYZ',
                'status_id' => 4, // Completed
                ...$this->timestamps('2025-11-20 11:00:00', '2026-01-10 16:00:00'),
            ],

            // Workspace 3 (Personal - User 1)
            [
                'id' => 6,
                'workspace_id' => 3,
                'name' => 'Belajar Rust',
                'status_id' => 1, // Active
                ...$this->timestamps('2026-01-20 19:00:00'),
            ],

            // Workspace 4 (Pekerjaan - User 2)
            [
                'id' => 7,
                'workspace_id' => 4,
                'name' => 'Internal Dashboard',
                'status_id' => 5, // Aktif (User 2's status)
                ...$this->timestamps('2026-01-10 08:30:00'),
            ],
        ];
    }

    // ==================================================================================
    // OPUS TASKS TABLE
    // Task/kartu kanban dalam proyek
    // Relasi: BelongsTo OpusProject, BelongsTo OpusTaskStatus, BelongsTo OpusTaskPriority
    // ==================================================================================
    public function opusTasks(): array
    {
        return [
            // Project 1 - Website Redesign PT ABC
            [
                'id' => 1,
                'project_id' => 1,
                'title' => 'Design mockup homepage',
                'description' => 'Buat mockup design untuk homepage baru dengan Figma',
                'status_id' => 4, // Done
                'priority_id' => 3, // High
                'due_date' => '2026-01-20 17:00:00',
                'meta' => json_encode([
                    'tags' => ['design', 'figma'],
                    'checklist' => [
                        ['text' => 'Header section', 'done' => true],
                        ['text' => 'Hero section', 'done' => true],
                        ['text' => 'Footer section', 'done' => true],
                    ],
                ]),
                ...$this->timestamps('2026-01-10 09:00:00', '2026-01-18 15:30:00'),
            ],
            [
                'id' => 2,
                'project_id' => 1,
                'title' => 'Implement responsive navbar',
                'description' => 'Buat navbar yang responsive dengan mobile menu',
                'status_id' => 2, // In Progress
                'priority_id' => 2, // Medium
                'due_date' => '2026-02-01 17:00:00',
                'meta' => json_encode([
                    'tags' => ['frontend', 'tailwind'],
                ]),
                ...$this->timestamps('2026-01-15 10:00:00'),
            ],
            [
                'id' => 3,
                'project_id' => 1,
                'title' => 'Setup CI/CD pipeline',
                'description' => null,
                'status_id' => 1, // To Do
                'priority_id' => 1, // Low
                'due_date' => null,
                'meta' => null,
                ...$this->timestamps('2026-01-20 11:00:00'),
            ],
            [
                'id' => 4,
                'project_id' => 1,
                'title' => 'Fix critical security bug',
                'description' => 'Ada XSS vulnerability di form contact',
                'status_id' => 2, // In Progress
                'priority_id' => 4, // Urgent
                'due_date' => '2026-01-25 12:00:00',
                'meta' => json_encode([
                    'tags' => ['bug', 'security', 'critical'],
                ]),
                ...$this->timestamps('2026-01-22 08:00:00'),
            ],

            // Project 2 - Mobile App
            [
                'id' => 5,
                'project_id' => 2,
                'title' => 'Setup React Native project',
                'description' => 'Initialize project dengan Expo',
                'status_id' => 4, // Done
                'priority_id' => 3, // High
                'due_date' => '2026-01-15 17:00:00',
                'meta' => null,
                ...$this->timestamps('2026-01-08 10:30:00', '2026-01-12 16:00:00'),
            ],
            [
                'id' => 6,
                'project_id' => 2,
                'title' => 'Design authentication flow',
                'description' => 'Login, register, forgot password screens',
                'status_id' => 3, // Review
                'priority_id' => 2, // Medium
                'due_date' => '2026-01-28 17:00:00',
                'meta' => json_encode([
                    'tags' => ['design', 'auth'],
                    'subtasks' => [
                        'Login screen',
                        'Register screen',
                        'Forgot password screen',
                    ],
                ]),
                ...$this->timestamps('2026-01-14 09:00:00'),
            ],

            // Project 4 - E-commerce Freelance
            [
                'id' => 7,
                'project_id' => 4,
                'title' => 'Integrasi payment gateway',
                'description' => 'Integrasi dengan Midtrans untuk pembayaran',
                'status_id' => 1, // To Do
                'priority_id' => 3, // High
                'due_date' => '2026-02-05 17:00:00',
                'meta' => json_encode([
                    'tags' => ['backend', 'payment'],
                ]),
                ...$this->timestamps('2026-01-18 14:00:00'),
            ],

            // Project 7 - Internal Dashboard (User 2)
            [
                'id' => 8,
                'project_id' => 7,
                'title' => 'Buat chart analytics',
                'description' => 'Dashboard dengan Chart.js',
                'status_id' => 6, // Sedang Dikerjakan (User 2's status)
                'priority_id' => 6, // Tinggi (User 2's priority)
                'due_date' => '2026-02-10 17:00:00',
                'meta' => null,
                ...$this->timestamps('2026-01-22 08:30:00'),
            ],
        ];
    }

    // ==================================================================================
    //
    // ███████╗████████╗██╗   ██╗██████╗ ██╗██╗   ██╗███╗   ███╗
    // ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██║   ██║████╗ ████║
    // ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║██╔████╔██║
    // ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║██║╚██╔╝██║
    // ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝██║ ╚═╝ ██║
    // ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝
    //
    // Modul untuk manajemen akademik (kuliah, tugas, jadwal)
    // ==================================================================================

    // ==================================================================================
    // STUDIUM ASSIGNMENT TYPES TABLE
    // Tipe tugas dinamis (per user)
    // Relasi: BelongsTo User, HasMany StudiumAssignment
    // ==================================================================================
    public function studiumAssignmentTypes(): array
    {
        return [
            // User 1
            [
                'id' => 1,
                'user_id' => 1,
                'slug' => 'tugas',
                'name' => 'Tugas',
                'color' => '#3b82f6',
                'order' => 1,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'slug' => 'kuis',
                'name' => 'Kuis',
                'color' => '#8b5cf6',
                'order' => 2,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'slug' => 'uts',
                'name' => 'UTS',
                'color' => '#f59e0b',
                'order' => 3,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'slug' => 'uas',
                'name' => 'UAS',
                'color' => '#ef4444',
                'order' => 4,
                'is_system' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'slug' => 'proyek',
                'name' => 'Proyek Kelompok',
                'color' => '#22c55e',
                'order' => 5,
                'is_system' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'slug' => 'presentasi',
                'name' => 'Presentasi',
                'color' => '#ec4899',
                'order' => 6,
                'is_system' => false,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // STUDIUM PROGRAMS TABLE
    // Program studi (S1, S2, Kursus, dll)
    // Relasi: BelongsTo User, HasMany StudiumSemester
    // ==================================================================================
    public function studiumPrograms(): array
    {
        return [
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'S2 MBA - Manajemen Bisnis',
                'institution' => 'Universitas Parahyangan',
                'start_date' => '2025-08-01',
                'end_date' => '2027-07-31', // Estimasi lulus
                ...$this->timestamps('2025-07-15 10:00:00'),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'Kursus Bahasa Jerman',
                'institution' => 'Goethe Institut',
                'start_date' => '2026-01-10',
                'end_date' => '2026-06-30',
                ...$this->timestamps('2026-01-05 14:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // STUDIUM SEMESTERS TABLE
    // Semester dalam program
    // Relasi: BelongsTo StudiumProgram, HasMany StudiumCourse
    // ==================================================================================
    public function studiumSemesters(): array
    {
        return [
            // Program 1 - S2 MBA
            [
                'id' => 1,
                'program_id' => 1,
                'name' => 'Semester 1',
                'is_active' => false,
                ...$this->timestamps('2025-08-01 08:00:00'),
            ],
            [
                'id' => 2,
                'program_id' => 1,
                'name' => 'Semester 2',
                'is_active' => true, // Semester aktif saat ini
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],
            [
                'id' => 3,
                'program_id' => 1,
                'name' => 'Semester Pendek',
                'is_active' => false,
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],

            // Program 2 - Kursus Bahasa Jerman
            [
                'id' => 4,
                'program_id' => 2,
                'name' => 'Level A1',
                'is_active' => true,
                ...$this->timestamps('2026-01-10 09:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // STUDIUM COURSES TABLE
    // Mata kuliah dalam semester
    // Relasi: BelongsTo StudiumSemester, HasMany StudiumAssignment
    // ==================================================================================
    public function studiumCourses(): array
    {
        return [
            // Semester 2 - S2 MBA
            [
                'id' => 1,
                'semester_id' => 2,
                'name' => 'Manajemen Strategis',
                'code' => 'MGT-504',
                'credits' => 3,
                'schedule_data' => json_encode([
                    'day' => 'Monday',
                    'start' => '19:00',
                    'end' => '21:30',
                    'room' => 'B201',
                ]),
                'lecturer_name' => 'Dr. Bambang Suryadi, MBA',
                'lecturer_contact' => 'bambang.s@unpar.ac.id',
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],
            [
                'id' => 2,
                'semester_id' => 2,
                'name' => 'Keuangan Perusahaan',
                'code' => 'FIN-502',
                'credits' => 3,
                'schedule_data' => json_encode([
                    'day' => 'Wednesday',
                    'start' => '19:00',
                    'end' => '21:30',
                    'room' => 'A105',
                ]),
                'lecturer_name' => 'Prof. Siti Rahayu, Ph.D',
                'lecturer_contact' => '+62812345678',
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],
            [
                'id' => 3,
                'semester_id' => 2,
                'name' => 'Perilaku Organisasi',
                'code' => 'MGT-506',
                'credits' => 3,
                'schedule_data' => json_encode([
                    'day' => 'Friday',
                    'start' => '18:30',
                    'end' => '21:00',
                    'room' => 'B202',
                ]),
                'lecturer_name' => 'Dr. Ahmad Fadli',
                'lecturer_contact' => null,
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],

            // Level A1 - Kursus Bahasa Jerman
            [
                'id' => 4,
                'semester_id' => 4,
                'name' => 'Deutsch A1.1',
                'code' => 'DEU-A11',
                'credits' => 0, // Kursus tidak ada SKS
                'schedule_data' => json_encode([
                    'day' => 'Saturday',
                    'start' => '09:00',
                    'end' => '12:00',
                    'room' => 'Online - Zoom',
                ]),
                'lecturer_name' => 'Frau Müller',
                'lecturer_contact' => 'muller@goethe.de',
                ...$this->timestamps('2026-01-10 09:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // STUDIUM ASSIGNMENTS TABLE
    // Tugas, kuis, ujian dalam mata kuliah
    // Relasi: BelongsTo StudiumCourse, BelongsTo StudiumAssignmentType
    // ==================================================================================
    public function studiumAssignments(): array
    {
        return [
            // Course 1 - Manajemen Strategis
            [
                'id' => 1,
                'course_id' => 1,
                'title' => 'Analisis SWOT Perusahaan',
                'type_id' => 1, // Tugas
                'deadline' => '2026-02-10 23:59:00',
                'grade' => null, // Belum dinilai
                'gcal_event_id' => 'gcal_event_123abc',
                ...$this->timestamps('2026-01-20 19:30:00'),
            ],
            [
                'id' => 2,
                'course_id' => 1,
                'title' => 'Kuis Bab 1-3',
                'type_id' => 2, // Kuis
                'deadline' => '2026-02-03 20:00:00',
                'grade' => 85.50,
                'gcal_event_id' => null,
                ...$this->timestamps('2026-01-22 19:00:00', '2026-02-04 10:00:00'),
            ],
            [
                'id' => 3,
                'course_id' => 1,
                'title' => 'UTS Manajemen Strategis',
                'type_id' => 3, // UTS
                'deadline' => '2026-03-15 19:00:00',
                'grade' => null,
                'gcal_event_id' => 'gcal_event_456def',
                ...$this->timestamps('2026-01-15 08:00:00'),
            ],

            // Course 2 - Keuangan Perusahaan
            [
                'id' => 4,
                'course_id' => 2,
                'title' => 'Case Study: Valuasi Startup',
                'type_id' => 5, // Proyek Kelompok
                'deadline' => '2026-02-20 23:59:00',
                'grade' => null,
                'gcal_event_id' => null,
                ...$this->timestamps('2026-01-18 19:30:00'),
            ],
            [
                'id' => 5,
                'course_id' => 2,
                'title' => 'Presentasi Analisis Laporan Keuangan',
                'type_id' => 6, // Presentasi
                'deadline' => '2026-02-12 19:00:00',
                'grade' => 90.00,
                'gcal_event_id' => 'gcal_event_789ghi',
                ...$this->timestamps('2026-01-20 19:00:00', '2026-02-13 10:00:00'),
            ],

            // Course 4 - Deutsch A1.1
            [
                'id' => 6,
                'course_id' => 4,
                'title' => 'Hausaufgabe Woche 2',
                'type_id' => 1, // Tugas
                'deadline' => '2026-02-01 09:00:00',
                'grade' => 95.00,
                'gcal_event_id' => null,
                ...$this->timestamps('2026-01-25 12:00:00', '2026-02-02 10:00:00'),
            ],
        ];
    }

    // ==================================================================================
    //
    // ██╗   ██╗ ██████╗  ██████╗ █████╗ ████████╗██╗ ██████╗
    // ██║   ██║██╔═══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗
    // ██║   ██║██║   ██║██║     ███████║   ██║   ██║██║   ██║
    // ╚██╗ ██╔╝██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║
    //  ╚████╔╝ ╚██████╔╝╚██████╗██║  ██║   ██║   ██║╚██████╔╝
    //   ╚═══╝   ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝
    //
    // Modul untuk tracking lamaran kerja (Job Application Tracker)
    // ==================================================================================

    // ==================================================================================
    // VOCATIO JOB STATUSES TABLE
    // Status lamaran dinamis (per user)
    // Relasi: BelongsTo User, HasMany VocatioJob
    // ==================================================================================
    public function vocatioJobStatuses(): array
    {
        return [
            // User 1
            [
                'id' => 1,
                'user_id' => 1,
                'slug' => 'saved',
                'name' => 'Saved',
                'color' => '#64748b',
                'order' => 1,
                'is_system' => true,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'slug' => 'applied',
                'name' => 'Applied',
                'color' => '#3b82f6',
                'order' => 2,
                'is_system' => true,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'slug' => 'phone_screen',
                'name' => 'Phone Screen',
                'color' => '#8b5cf6',
                'order' => 3,
                'is_system' => false,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'slug' => 'interview',
                'name' => 'Interview',
                'color' => '#f59e0b',
                'order' => 4,
                'is_system' => true,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'slug' => 'offer',
                'name' => 'Offer',
                'color' => '#22c55e',
                'order' => 5,
                'is_system' => true,
                'is_final' => true, // Status akhir positif
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'slug' => 'rejected',
                'name' => 'Rejected',
                'color' => '#ef4444',
                'order' => 6,
                'is_system' => true,
                'is_final' => true, // Status akhir negatif
                ...$this->timestamps(),
            ],

            // User 2
            [
                'id' => 7,
                'user_id' => 2,
                'slug' => 'wishlist',
                'name' => 'Wishlist',
                'color' => '#64748b',
                'order' => 1,
                'is_system' => true,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 8,
                'user_id' => 2,
                'slug' => 'melamar',
                'name' => 'Sudah Melamar',
                'color' => '#3b82f6',
                'order' => 2,
                'is_system' => true,
                'is_final' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 9,
                'user_id' => 2,
                'slug' => 'diterima',
                'name' => 'Diterima',
                'color' => '#22c55e',
                'order' => 3,
                'is_system' => true,
                'is_final' => true,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // VOCATIO PIPELINES TABLE
    // Wadah/grup untuk lowongan (contoh: "Loker IT 2026", "Loker MT")
    // Relasi: BelongsTo User, HasMany VocatioJob
    // ==================================================================================
    public function vocatioPipelines(): array
    {
        return [
            // User 1
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'Fresh Graduate 2026',
                'is_default' => true,
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'Remote Jobs',
                'is_default' => false,
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'name' => 'Management Trainee',
                'is_default' => false,
                ...$this->timestamps(),
            ],

            // User 2
            [
                'id' => 4,
                'user_id' => 2,
                'name' => 'Loker Jakarta',
                'is_default' => true,
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // VOCATIO JOBS TABLE
    // Kartu lamaran kerja
    // Relasi: BelongsTo User, BelongsTo VocatioJobStatus, BelongsTo VocatioPipeline
    // ==================================================================================
    public function vocatioJobs(): array
    {
        return [
            // User 1 - Pipeline 1 (Fresh Graduate 2026)
            [
                'id' => '550e8400-e29b-41d4-a716-446655440001',
                'company' => 'Gojek',
                'position' => 'Software Engineer',
                'url' => 'https://gojek.com/careers/se-2026',
                'location' => 'Jakarta, Indonesia',
                'notes' => 'Sudah apply tanggal 15 Jan. Waiting for response.',
                'due_date' => '2026-02-28',
                'level_of_interest' => 5, // Sangat tertarik
                'salary_min' => 15000000.00,
                'salary_max' => 25000000.00,
                'user_id' => 1,
                'status_id' => 2, // Applied
                'pipeline_id' => 1,
                ...$this->timestamps('2026-01-15 10:00:00'),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'company' => 'Tokopedia',
                'position' => 'Backend Engineer',
                'url' => 'https://tokopedia.com/careers/backend',
                'location' => 'Jakarta, Indonesia',
                'notes' => 'Interview HR scheduled for Feb 5',
                'due_date' => '2026-02-05',
                'level_of_interest' => 4,
                'salary_min' => 12000000.00,
                'salary_max' => 20000000.00,
                'user_id' => 1,
                'status_id' => 4, // Interview
                'pipeline_id' => 1,
                ...$this->timestamps('2026-01-10 09:00:00', '2026-01-28 14:00:00'),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440003',
                'company' => 'Shopee',
                'position' => 'Product Manager',
                'url' => 'https://shopee.com/careers/pm',
                'location' => 'Singapore',
                'notes' => null,
                'due_date' => null,
                'level_of_interest' => 3,
                'salary_min' => null,
                'salary_max' => null,
                'user_id' => 1,
                'status_id' => 1, // Saved
                'pipeline_id' => 1,
                ...$this->timestamps('2026-01-25 16:00:00'),
            ],

            // User 1 - Pipeline 2 (Remote Jobs)
            [
                'id' => '550e8400-e29b-41d4-a716-446655440004',
                'company' => 'GitLab',
                'position' => 'Frontend Engineer (Remote)',
                'url' => 'https://gitlab.com/jobs/fe',
                'location' => 'Remote - Worldwide',
                'notes' => 'Fully remote, async culture. Perfect!',
                'due_date' => '2026-03-15',
                'level_of_interest' => 5,
                'salary_min' => 80000.00, // USD
                'salary_max' => 120000.00,
                'user_id' => 1,
                'status_id' => 2, // Applied
                'pipeline_id' => 2,
                ...$this->timestamps('2026-01-20 11:00:00'),
            ],

            // User 1 - Pipeline 3 (Management Trainee)
            [
                'id' => '550e8400-e29b-41d4-a716-446655440005',
                'company' => 'Unilever',
                'position' => 'UFLP - Future Leaders Programme',
                'url' => 'https://unilever.com/careers/uflp',
                'location' => 'Jakarta, Indonesia',
                'notes' => 'Got offer! Need to decide by Feb 15',
                'due_date' => '2026-02-15',
                'level_of_interest' => 4,
                'salary_min' => 10000000.00,
                'salary_max' => 15000000.00,
                'user_id' => 1,
                'status_id' => 5, // Offer
                'pipeline_id' => 3,
                ...$this->timestamps('2025-11-01 09:00:00', '2026-01-28 10:00:00'),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440006',
                'company' => 'Bank Mandiri',
                'position' => 'Officer Development Program',
                'url' => 'https://mandiri.co.id/karir/odp',
                'location' => 'Jakarta, Indonesia',
                'notes' => 'Rejected after final interview',
                'due_date' => null,
                'level_of_interest' => 3,
                'salary_min' => 8000000.00,
                'salary_max' => 12000000.00,
                'user_id' => 1,
                'status_id' => 6, // Rejected
                'pipeline_id' => 3,
                ...$this->timestamps('2025-10-15 14:00:00', '2026-01-05 11:00:00'),
            ],

            // User 2 - Pipeline 4 (Loker Jakarta)
            [
                'id' => '550e8400-e29b-41d4-a716-446655440007',
                'company' => 'Traveloka',
                'position' => 'Data Analyst',
                'url' => 'https://traveloka.com/careers/data',
                'location' => 'Jakarta, Indonesia',
                'notes' => 'Menarik banget!',
                'due_date' => '2026-02-20',
                'level_of_interest' => 5,
                'salary_min' => 10000000.00,
                'salary_max' => 18000000.00,
                'user_id' => 2,
                'status_id' => 8, // Sudah Melamar (User 2's status)
                'pipeline_id' => 4,
                ...$this->timestamps('2026-01-22 15:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // VOCATIO JOB SHARES TABLE
    // Fitur share lowongan ke teman
    // Relasi: BelongsTo VocatioJob, BelongsTo User (sender), BelongsTo User (receiver)
    // ==================================================================================
    public function vocatioJobShares(): array
    {
        return [
            [
                'id' => '660e8400-e29b-41d4-a716-446655440001',
                'message' => 'Hey, ini lowongan cocok buat kamu! Coba apply deh.',
                'status' => 'accepted',
                'job_id' => '550e8400-e29b-41d4-a716-446655440001', // Gojek SE
                'sender_id' => 1, // John
                'receiver_id' => 2, // Jane
                ...$this->timestamps('2026-01-16 11:00:00', '2026-01-16 14:30:00'),
            ],
            [
                'id' => '660e8400-e29b-41d4-a716-446655440002',
                'message' => 'GitLab lagi buka remote position!',
                'status' => 'pending',
                'job_id' => '550e8400-e29b-41d4-a716-446655440004', // GitLab FE
                'sender_id' => 1,
                'receiver_id' => 3, // Ahmad
                ...$this->timestamps('2026-01-21 09:00:00'),
            ],
            [
                'id' => '660e8400-e29b-41d4-a716-446655440003',
                'message' => null,
                'status' => 'declined',
                'job_id' => '550e8400-e29b-41d4-a716-446655440003', // Shopee PM
                'sender_id' => 2,
                'receiver_id' => 1,
                ...$this->timestamps('2026-01-26 10:00:00', '2026-01-26 18:00:00'),
            ],
        ];
    }

    // ==================================================================================
    //
    // ██████╗ ███████╗██████╗ ███╗   ███╗██╗███████╗███████╗██╗ ██████╗ ███╗   ██╗███████╗
    // ██╔══██╗██╔════╝██╔══██╗████╗ ████║██║██╔════╝██╔════╝██║██╔═══██╗████╗  ██║██╔════╝
    // ██████╔╝█████╗  ██████╔╝██╔████╔██║██║███████╗███████╗██║██║   ██║██╔██╗ ██║███████╗
    // ██╔═══╝ ██╔══╝  ██╔══██╗██║╚██╔╝██║██║╚════██║╚════██║██║██║   ██║██║╚██╗██║╚════██║
    // ██║     ███████╗██║  ██║██║ ╚═╝ ██║██║███████║███████║██║╚██████╔╝██║ ╚████║███████║
    // ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
    //
    // Spatie Laravel Permission Tables
    // ==================================================================================

    // ==================================================================================
    // PERMISSIONS TABLE
    // Daftar permission yang tersedia
    // Relasi: BelongsToMany Role, BelongsToMany User
    // ==================================================================================
    public function permissions(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'view users',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'name' => 'create users',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'name' => 'edit users',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 4,
                'name' => 'delete users',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 5,
                'name' => 'manage settings',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 6,
                'name' => 'view analytics',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // ROLES TABLE
    // Daftar role yang tersedia
    // Relasi: BelongsToMany Permission, BelongsToMany User
    // ==================================================================================
    public function roles(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'admin',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 2,
                'name' => 'user',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
            [
                'id' => 3,
                'name' => 'moderator',
                'guard_name' => 'web',
                ...$this->timestamps(),
            ],
        ];
    }

    // ==================================================================================
    // MODEL HAS PERMISSIONS TABLE (Pivot)
    // Direct permission assignment ke model (User)
    // ==================================================================================
    public function modelHasPermissions(): array
    {
        return [
            // User 1 punya permission langsung untuk view analytics
            [
                'permission_id' => 6,
                'model_type' => 'App\\Models\\User',
                'model_id' => 1,
            ],
        ];
    }

    // ==================================================================================
    // MODEL HAS ROLES TABLE (Pivot)
    // Role assignment ke model (User)
    // ==================================================================================
    public function modelHasRoles(): array
    {
        return [
            // User 1 = Admin
            [
                'role_id' => 1, // admin
                'model_type' => 'App\\Models\\User',
                'model_id' => 1,
            ],
            // User 2 = User + Moderator
            [
                'role_id' => 2, // user
                'model_type' => 'App\\Models\\User',
                'model_id' => 2,
            ],
            [
                'role_id' => 3, // moderator
                'model_type' => 'App\\Models\\User',
                'model_id' => 2,
            ],
            // User 3 = User
            [
                'role_id' => 2, // user
                'model_type' => 'App\\Models\\User',
                'model_id' => 3,
            ],
        ];
    }

    // ==================================================================================
    // ROLE HAS PERMISSIONS TABLE (Pivot)
    // Permission assignment ke role
    // ==================================================================================
    public function roleHasPermissions(): array
    {
        return [
            // Admin role punya semua permission
            ['permission_id' => 1, 'role_id' => 1],
            ['permission_id' => 2, 'role_id' => 1],
            ['permission_id' => 3, 'role_id' => 1],
            ['permission_id' => 4, 'role_id' => 1],
            ['permission_id' => 5, 'role_id' => 1],
            ['permission_id' => 6, 'role_id' => 1],

            // Moderator role punya beberapa permission
            ['permission_id' => 1, 'role_id' => 3], // view users
            ['permission_id' => 3, 'role_id' => 3], // edit users

            // User role hanya view
            ['permission_id' => 1, 'role_id' => 2], // view users
        ];
    }

    // ==================================================================================
    //
    //  █████╗  ██████╗████████╗██╗██╗   ██╗██╗████████╗██╗   ██╗    ██╗      ██████╗  ██████╗
    // ██╔══██╗██╔════╝╚══██╔══╝██║██║   ██║██║╚══██╔══╝╚██╗ ██╔╝    ██║     ██╔═══██╗██╔════╝
    // ███████║██║        ██║   ██║██║   ██║██║   ██║    ╚████╔╝     ██║     ██║   ██║██║  ███╗
    // ██╔══██║██║        ██║   ██║╚██╗ ██╔╝██║   ██║     ╚██╔╝      ██║     ██║   ██║██║   ██║
    // ██║  ██║╚██████╗   ██║   ██║ ╚████╔╝ ██║   ██║      ██║       ███████╗╚██████╔╝╚██████╔╝
    // ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝  ╚═══╝  ╚═╝   ╚═╝      ╚═╝       ╚══════╝ ╚═════╝  ╚═════╝
    //
    // Spatie Laravel Activitylog Tables
    // ==================================================================================

    // ==================================================================================
    // ACTIVITY LOG TABLE
    // Mencatat semua aktivitas dalam aplikasi
    // Relasi: MorphTo subject, MorphTo causer
    // ==================================================================================
    public function activityLog(): array
    {
        return [
            [
                'id' => 1,
                'log_name' => 'default',
                'description' => 'created',
                'subject_type' => 'App\\Models\\User',
                'subject_id' => 2,
                'event' => 'created',
                'causer_type' => 'App\\Models\\User',
                'causer_id' => 1, // Admin created user 2
                'properties' => json_encode([
                    'attributes' => [
                        'name' => 'Jane Smith',
                        'email' => 'jane@example.com',
                    ],
                ]),
                'batch_uuid' => null,
                ...$this->timestamps('2026-01-12 12:00:00'),
            ],
            [
                'id' => 2,
                'log_name' => 'opus',
                'description' => 'created',
                'subject_type' => 'App\\Models\\OpusProject',
                'subject_id' => 1,
                'event' => 'created',
                'causer_type' => 'App\\Models\\User',
                'causer_id' => 1,
                'properties' => json_encode([
                    'attributes' => [
                        'name' => 'Website Redesign PT ABC',
                    ],
                ]),
                'batch_uuid' => '7b52009b-64fd-0a2a-49e6-d8a939753077',
                ...$this->timestamps('2026-01-05 09:00:00'),
            ],
            [
                'id' => 3,
                'log_name' => 'opus',
                'description' => 'updated',
                'subject_type' => 'App\\Models\\OpusTask',
                'subject_id' => 1,
                'event' => 'updated',
                'causer_type' => 'App\\Models\\User',
                'causer_id' => 1,
                'properties' => json_encode([
                    'old' => [
                        'status_id' => 2, // In Progress
                    ],
                    'attributes' => [
                        'status_id' => 4, // Done
                    ],
                ]),
                'batch_uuid' => null,
                ...$this->timestamps('2026-01-18 15:30:00'),
            ],
            [
                'id' => 4,
                'log_name' => 'vocatio',
                'description' => 'created',
                'subject_type' => 'App\\Models\\VocatioJob',
                'subject_id' => null, // UUID tidak bisa di-morph dengan ID
                'event' => 'created',
                'causer_type' => 'App\\Models\\User',
                'causer_id' => 1,
                'properties' => json_encode([
                    'attributes' => [
                        'company' => 'Gojek',
                        'position' => 'Software Engineer',
                    ],
                ]),
                'batch_uuid' => null,
                ...$this->timestamps('2026-01-15 10:00:00'),
            ],
            [
                'id' => 5,
                'log_name' => 'auth',
                'description' => 'User logged in',
                'subject_type' => 'App\\Models\\User',
                'subject_id' => 1,
                'event' => 'login',
                'causer_type' => 'App\\Models\\User',
                'causer_id' => 1,
                'properties' => json_encode([
                    'ip' => '192.168.1.100',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                ]),
                'batch_uuid' => null,
                ...$this->timestamps('2026-01-30 08:00:00'),
            ],
        ];
    }

    // ==================================================================================
    // HELPER: GET ALL DATA
    // Mendapatkan semua dummy data sekaligus
    // ==================================================================================
    public function all(): array
    {
        return [
            // Core Tables
            'users' => $this->users(),
            'password_reset_tokens' => $this->passwordResetTokens(),
            'sessions' => $this->sessions(),
            'user_modules' => $this->userModules(),

            // Opus Module (Project & Task Management)
            'opus_project_statuses' => $this->opusProjectStatuses(),
            'opus_task_statuses' => $this->opusTaskStatuses(),
            'opus_task_priorities' => $this->opusTaskPriorities(),
            'opus_workspaces' => $this->opusWorkspaces(),
            'opus_projects' => $this->opusProjects(),
            'opus_tasks' => $this->opusTasks(),

            // Studium Module (Academic Management)
            'studium_assignment_types' => $this->studiumAssignmentTypes(),
            'studium_programs' => $this->studiumPrograms(),
            'studium_semesters' => $this->studiumSemesters(),
            'studium_courses' => $this->studiumCourses(),
            'studium_assignments' => $this->studiumAssignments(),

            // Vocatio Module (Job Application Tracker)
            'vocatio_job_statuses' => $this->vocatioJobStatuses(),
            'vocatio_pipelines' => $this->vocatioPipelines(),
            'vocatio_jobs' => $this->vocatioJobs(),
            'vocatio_job_shares' => $this->vocatioJobShares(),

            // Permission Tables
            'permissions' => $this->permissions(),
            'roles' => $this->roles(),
            'model_has_permissions' => $this->modelHasPermissions(),
            'model_has_roles' => $this->modelHasRoles(),
            'role_has_permissions' => $this->roleHasPermissions(),

            // Activity Log
            'activity_log' => $this->activityLog(),
        ];
    }

    // ==================================================================================
    // HELPER: GET DATA WITH RELATIONSHIPS (Simulated Eloquent-like)
    // Mendapatkan data dengan relasi seperti Eloquent ORM
    // ==================================================================================

    /**
     * Get user with all relations
     * Simulates: User::with(['modules', 'roles', 'permissions'])->find($id)
     */
    public function getUserWithRelations(int $userId): ?array
    {
        $user = collect($this->users())->firstWhere('id', $userId);
        if (! $user) {
            return null;
        }

        // Attach modules
        $user['modules'] = collect($this->userModules())
            ->where('user_id', $userId)
            ->values()
            ->toArray();

        // Attach roles
        $roleIds = collect($this->modelHasRoles())
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $userId)
            ->pluck('role_id')
            ->toArray();

        $user['roles'] = collect($this->roles())
            ->whereIn('id', $roleIds)
            ->values()
            ->toArray();

        return $user;
    }

    /**
     * Get opus workspace with projects and tasks
     * Simulates: OpusWorkspace::with(['projects.tasks', 'projects.status'])->find($id)
     */
    public function getWorkspaceWithProjects(int $workspaceId): ?array
    {
        $workspace = collect($this->opusWorkspaces())->firstWhere('id', $workspaceId);
        if (! $workspace) {
            return null;
        }

        $projects = collect($this->opusProjects())
            ->where('workspace_id', $workspaceId)
            ->map(function ($project) {
                // Attach status
                $project['status'] = collect($this->opusProjectStatuses())
                    ->firstWhere('id', $project['status_id']);

                // Attach tasks
                $project['tasks'] = collect($this->opusTasks())
                    ->where('project_id', $project['id'])
                    ->map(function ($task) {
                        $task['status'] = collect($this->opusTaskStatuses())
                            ->firstWhere('id', $task['status_id']);
                        $task['priority'] = collect($this->opusTaskPriorities())
                            ->firstWhere('id', $task['priority_id']);

                        return $task;
                    })
                    ->values()
                    ->toArray();

                return $project;
            })
            ->values()
            ->toArray();

        $workspace['projects'] = $projects;

        return $workspace;
    }

    /**
     * Get studium program with full hierarchy
     * Simulates: StudiumProgram::with(['semesters.courses.assignments'])->find($id)
     */
    public function getProgramWithHierarchy(int $programId): ?array
    {
        $program = collect($this->studiumPrograms())->firstWhere('id', $programId);
        if (! $program) {
            return null;
        }

        $semesters = collect($this->studiumSemesters())
            ->where('program_id', $programId)
            ->map(function ($semester) {
                $semester['courses'] = collect($this->studiumCourses())
                    ->where('semester_id', $semester['id'])
                    ->map(function ($course) {
                        $course['assignments'] = collect($this->studiumAssignments())
                            ->where('course_id', $course['id'])
                            ->map(function ($assignment) {
                                $assignment['type'] = collect($this->studiumAssignmentTypes())
                                    ->firstWhere('id', $assignment['type_id']);

                                return $assignment;
                            })
                            ->values()
                            ->toArray();

                        return $course;
                    })
                    ->values()
                    ->toArray();

                return $semester;
            })
            ->values()
            ->toArray();

        $program['semesters'] = $semesters;

        return $program;
    }

    /**
     * Get vocatio pipeline with jobs
     * Simulates: VocatioPipeline::with(['jobs.status'])->find($id)
     */
    public function getPipelineWithJobs(int $pipelineId): ?array
    {
        $pipeline = collect($this->vocatioPipelines())->firstWhere('id', $pipelineId);
        if (! $pipeline) {
            return null;
        }

        $jobs = collect($this->vocatioJobs())
            ->where('pipeline_id', $pipelineId)
            ->map(function ($job) {
                $job['status'] = collect($this->vocatioJobStatuses())
                    ->firstWhere('id', $job['status_id']);

                return $job;
            })
            ->values()
            ->toArray();

        $pipeline['jobs'] = $jobs;

        return $pipeline;
    }
}
