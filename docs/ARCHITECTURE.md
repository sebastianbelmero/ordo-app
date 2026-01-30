# Arsitektur Repository Pattern - Ordo

## Struktur Folder

```
app/
├── Contracts/
│   └── Repositories/           # Interface (Kontrak)
│       ├── UserRepositoryInterface.php
│       ├── Opus/
│       │   ├── WorkspaceRepositoryInterface.php
│       │   ├── ProjectRepositoryInterface.php
│       │   ├── TaskRepositoryInterface.php
│       │   └── StatusRepositoryInterface.php
│       ├── Studium/
│       │   ├── ProgramRepositoryInterface.php
│       │   ├── SemesterRepositoryInterface.php
│       │   ├── CourseRepositoryInterface.php
│       │   └── AssignmentRepositoryInterface.php
│       └── Vocatio/
│           ├── PipelineRepositoryInterface.php
│           ├── JobRepositoryInterface.php
│           └── JobShareRepositoryInterface.php
│
├── Repositories/
│   └── Dummy/                  # Implementasi Dummy Data
│       ├── DummyUserRepository.php
│       ├── Opus/
│       │   ├── DummyWorkspaceRepository.php
│       │   ├── DummyProjectRepository.php
│       │   ├── DummyTaskRepository.php
│       │   └── DummyStatusRepository.php
│       ├── Studium/
│       │   ├── DummyProgramRepository.php
│       │   ├── DummySemesterRepository.php
│       │   ├── DummyCourseRepository.php
│       │   └── DummyAssignmentRepository.php
│       └── Vocatio/
│           ├── DummyPipelineRepository.php
│           ├── DummyJobRepository.php
│           └── DummyJobShareRepository.php
│
├── Services/                   # Business Logic
│   ├── UserService.php
│   ├── Opus/
│   │   └── OpusService.php
│   ├── Studium/
│   │   └── StudiumService.php
│   └── Vocatio/
│       └── VocatioService.php
│
├── Http/Controllers/           # HTTP Handlers
│   ├── DashboardController.php
│   ├── Opus/
│   │   ├── WorkspaceController.php
│   │   ├── ProjectController.php
│   │   └── TaskController.php
│   ├── Studium/
│   │   ├── ProgramController.php
│   │   ├── SemesterController.php
│   │   ├── CourseController.php
│   │   └── AssignmentController.php
│   └── Vocatio/
│       ├── PipelineController.php
│       ├── JobController.php
│       └── JobShareController.php
│
└── Providers/
    └── RepositoryServiceProvider.php  # Binding Interface -> Implementation

database/
└── DummyData.php               # Data dummy statis

routes/
├── web.php                     # Main routes
├── opus.php                    # Opus routes
├── studium.php                 # Studium routes
└── vocatio.php                 # Vocatio routes
```

## Alur Data (Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HTTP REQUEST                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               CONTROLLER                                     │
│  • Menerima HTTP request                                                    │
│  • Memanggil Service                                                        │
│  • Return Inertia response                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                SERVICE                                       │
│  • Business logic                                                           │
│  • Transformasi data                                                        │
│  • Aturan bisnis                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REPOSITORY INTERFACE                                │
│  • Kontrak abstrak                                                          │
│  • Tidak peduli implementasi                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│     DUMMY REPOSITORY            │ │    ELOQUENT REPOSITORY          │
│  (Sekarang - Dummy Data)        │ │  (Nanti - Database)             │
│                                 │ │                                 │
│  • Baca dari DummyData.php      │ │  • Baca dari database           │
│  • Tidak perlu migration        │ │  • Pakai Eloquent ORM           │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

## Cara Switch ke Database Asli

### Langkah 1: Buat Folder Eloquent Repository
```
app/Repositories/Eloquent/
├── EloquentUserRepository.php
├── Opus/
│   ├── EloquentWorkspaceRepository.php
│   └── ...
└── ...
```

### Langkah 2: Buat Implementasi (Contoh)

```php
<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function all(): array
    {
        return User::all()->toArray();
    }

    public function find(int $id): ?array
    {
        $user = User::find($id);
        return $user?->toArray();
    }

    public function findWithRelations(int $id, array $relations = []): ?array
    {
        $user = User::with($relations)->find($id);
        return $user?->toArray();
    }

    // ... implementasi method lainnya
}
```

### Langkah 3: Ubah Binding di RepositoryServiceProvider

```php
// app/Providers/RepositoryServiceProvider.php

// SEBELUM (Dummy Data):
$this->app->bind(
    UserRepositoryInterface::class,
    DummyUserRepository::class
);

// SESUDAH (Database):
$this->app->bind(
    UserRepositoryInterface::class,
    EloquentUserRepository::class
);
```

### DONE!
Controller dan Service **TIDAK PERLU DIUBAH** sama sekali.

## Routes yang Tersedia

### Opus (Project & Task Management)
| Method | URI | Name | View |
|--------|-----|------|------|
| GET | /opus/workspaces | opus.workspaces.index | Pages/Opus/Workspaces/Index.tsx |
| GET | /opus/workspaces/{id} | opus.workspaces.show | Pages/Opus/Workspaces/Show.tsx |
| GET | /opus/workspaces/{id}/projects | opus.workspaces.projects.index | Pages/Opus/Projects/Index.tsx |
| GET | /opus/projects/{id} | opus.projects.show | Pages/Opus/Projects/Show.tsx |
| GET | /opus/projects/{id}/board | opus.projects.board | Pages/Opus/Projects/Board.tsx |
| GET | /opus/projects/{id}/tasks | opus.projects.tasks.index | Pages/Opus/Tasks/Index.tsx |
| GET | /opus/tasks/{id} | opus.tasks.show | Pages/Opus/Tasks/Show.tsx |

### Studium (Academic Management)
| Method | URI | Name | View |
|--------|-----|------|------|
| GET | /studium/programs | studium.programs.index | Pages/Studium/Programs/Index.tsx |
| GET | /studium/programs/{id} | studium.programs.show | Pages/Studium/Programs/Show.tsx |
| GET | /studium/programs/{id}/overview | studium.programs.overview | Pages/Studium/Programs/Overview.tsx |
| GET | /studium/programs/{id}/semesters | studium.programs.semesters.index | Pages/Studium/Semesters/Index.tsx |
| GET | /studium/semesters/{id} | studium.semesters.show | Pages/Studium/Semesters/Show.tsx |
| GET | /studium/semesters/{id}/courses | studium.semesters.courses.index | Pages/Studium/Courses/Index.tsx |
| GET | /studium/courses/{id} | studium.courses.show | Pages/Studium/Courses/Show.tsx |
| GET | /studium/courses/{id}/assignments | studium.courses.assignments.index | Pages/Studium/Assignments/Index.tsx |
| GET | /studium/assignments/upcoming | studium.assignments.upcoming | Pages/Studium/Assignments/Upcoming.tsx |
| GET | /studium/assignments/{id} | studium.assignments.show | Pages/Studium/Assignments/Show.tsx |

### Vocatio (Job Application Tracker)
| Method | URI | Name | View |
|--------|-----|------|------|
| GET | /vocatio/pipelines | vocatio.pipelines.index | Pages/Vocatio/Pipelines/Index.tsx |
| GET | /vocatio/pipelines/{id} | vocatio.pipelines.show | Pages/Vocatio/Pipelines/Show.tsx |
| GET | /vocatio/pipelines/{id}/board | vocatio.pipelines.board | Pages/Vocatio/Pipelines/Board.tsx |
| GET | /vocatio/pipelines/{id}/jobs | vocatio.pipelines.jobs.index | Pages/Vocatio/Jobs/Index.tsx |
| GET | /vocatio/jobs | vocatio.jobs.index | Pages/Vocatio/Jobs/All.tsx |
| GET | /vocatio/jobs/{id} | vocatio.jobs.show | Pages/Vocatio/Jobs/Show.tsx |
| GET | /vocatio/shares | vocatio.shares.index | Pages/Vocatio/Shares/Index.tsx |
| GET | /vocatio/shares/{id} | vocatio.shares.show | Pages/Vocatio/Shares/Show.tsx |

### Dashboard
| Method | URI | Name | View |
|--------|-----|------|------|
| GET | /dashboard | dashboard | Pages/Dashboard.tsx |

## Inertia Pages yang Perlu Dibuat

Anda perlu membuat file-file berikut di `resources/js/Pages/`:

```
resources/js/Pages/
├── Dashboard.tsx
├── Opus/
│   ├── Workspaces/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   ├── Projects/
│   │   ├── Index.tsx
│   │   ├── Show.tsx
│   │   └── Board.tsx
│   └── Tasks/
│       ├── Index.tsx
│       └── Show.tsx
├── Studium/
│   ├── Programs/
│   │   ├── Index.tsx
│   │   ├── Show.tsx
│   │   └── Overview.tsx
│   ├── Semesters/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   ├── Courses/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   └── Assignments/
│       ├── Index.tsx
│       ├── Show.tsx
│       └── Upcoming.tsx
└── Vocatio/
    ├── Pipelines/
    │   ├── Index.tsx
    │   ├── Show.tsx
    │   └── Board.tsx
    ├── Jobs/
    │   ├── Index.tsx
    │   ├── All.tsx
    │   └── Show.tsx
    └── Shares/
        ├── Index.tsx
        └── Show.tsx
```

## Contoh Props yang Diterima Component

### Dashboard.tsx
```typescript
interface DashboardProps {
  user: {
    id: number;
    name: string;
    email: string;
    modules: Array<{ module: string; is_enabled: boolean }>;
    roles: Array<{ name: string }>;
  };
  opus?: {
    workspaces: { data: Array<Workspace> };
  };
  studium?: {
    programs: { data: Array<Program> };
    upcomingAssignments: { data: Array<Assignment> };
  };
  vocatio?: {
    pipelines: { data: Array<Pipeline> };
    pendingShares: { data: Array<Share> };
  };
}
```

### Opus/Projects/Board.tsx
```typescript
interface BoardProps {
  project: {
    id: number;
    name: string;
    status: ProjectStatus;
  };
  board: {
    data: Array<{
      id: number;
      name: string;    // "To Do", "In Progress", "Done"
      color: string;
      order: number;
      tasks: Array<Task>;
    }>;
  };
  statusConfig: {
    project_statuses: Array<ProjectStatus>;
    task_statuses: Array<TaskStatus>;
    task_priorities: Array<TaskPriority>;
  };
}
```
