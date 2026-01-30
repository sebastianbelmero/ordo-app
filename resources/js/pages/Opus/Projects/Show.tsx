import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Layers,
    MoreHorizontal,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
}

interface TaskStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_completed: boolean;
}

interface TaskPriority {
    id: number;
    slug: string;
    name: string;
    color: string;
    level: number;
}

interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status_id: number;
    priority_id: number;
    due_date: string | null;
    meta: string | null;
    created_at: string;
    updated_at: string;
    status?: TaskStatus;
    priority?: TaskPriority;
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    created_at: string;
    updated_at: string;
    status?: ProjectStatus;
    tasks?: Task[];
}

interface StatusConfig {
    project_statuses: ProjectStatus[];
    task_statuses: TaskStatus[];
    task_priorities: TaskPriority[];
}

interface ProjectShowProps {
    project: Project;
    statusConfig: StatusConfig;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function parseMeta(meta: string | null): { tags?: string[]; checklist?: { text: string; done: boolean }[] } | null {
    if (!meta) return null;
    try {
        return JSON.parse(meta);
    } catch {
        return null;
    }
}

// =============================================================================
// COMPONENTS
// =============================================================================

function TaskCard({ task }: { task: Task }) {
    const meta = parseMeta(task.meta);
    const overdue = !task.status?.is_completed && isOverdue(task.due_date);

    return (
        <div className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    {task.status?.is_completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                    ) : (
                        <div
                            className="mt-0.5 h-5 w-5 rounded-full border-2"
                            style={{ borderColor: task.status?.color ?? '#64748b' }}
                        />
                    )}
                    <div>
                        <h4 className={`font-medium ${task.status?.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                            </p>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/opus/tasks/${task.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Status */}
                {task.status && (
                    <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: task.status.color }}
                    >
                        {task.status.name}
                    </span>
                )}

                {/* Priority */}
                {task.priority && (
                    <span
                        className="inline-flex items-center rounded px-2 py-0.5 text-xs"
                        style={{
                            backgroundColor: `${task.priority.color}20`,
                            color: task.priority.color,
                        }}
                    >
                        {task.priority.name}
                    </span>
                )}

                {/* Due date */}
                {task.due_date && (
                    <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                            overdue
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                    </span>
                )}

                {/* Tags */}
                {meta?.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                        <Tag className="h-3 w-3" />
                        {tag}
                    </span>
                ))}
            </div>

            {/* Checklist */}
            {meta?.checklist && meta.checklist.length > 0 && (
                <div className="mt-3 rounded bg-muted/50 p-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        {meta.checklist.filter((c) => c.done).length}/{meta.checklist.length} items
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                                width: `${(meta.checklist.filter((c) => c.done).length / meta.checklist.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProjectShow({ project, statusConfig }: ProjectShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: 'Projects', href: '/opus/workspaces' },
        { title: project.name, href: `/opus/projects/${project.id}` },
    ];

    const tasks = project.tasks ?? [];
    const completedTasks = tasks.filter((t) => t.status?.is_completed).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Group tasks by status
    const tasksByStatus = statusConfig.task_statuses.reduce(
        (acc, status) => {
            acc[status.id] = tasks.filter((t) => t.status_id === status.id);
            return acc;
        },
        {} as Record<number, Task[]>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Opus`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/opus/workspaces">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{project.name}</h1>
                                {project.status && (
                                    <span
                                        className="rounded-full px-3 py-1 text-sm text-white"
                                        style={{ backgroundColor: project.status.color }}
                                    >
                                        {project.status.name}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Created {formatDateTime(project.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/opus/projects/${project.id}/board`}>
                            <Button variant="outline">
                                <Layers className="mr-2 h-4 w-4" />
                                Kanban Board
                            </Button>
                        </Link>
                        <Button asChild>
                            <Link href={`/opus/projects/${project.id}/tasks/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Task
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Layers className="h-4 w-4" />
                            Total Tasks
                        </div>
                        <p className="mt-1 text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Completed
                        </div>
                        <p className="mt-1 text-2xl font-bold">{completedTasks}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            In Progress
                        </div>
                        <p className="mt-1 text-2xl font-bold">
                            {tasks.filter((t) => t.status?.slug === 'in_progress').length}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Progress
                        </div>
                        <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{completedTasks}/{tasks.length}</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks by Status */}
                <div className="space-y-6">
                    {statusConfig.task_statuses.map((status) => {
                        const statusTasks = tasksByStatus[status.id] ?? [];
                        if (statusTasks.length === 0) return null;

                        return (
                            <div key={status.id}>
                                <div className="mb-3 flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <h3 className="font-semibold">{status.name}</h3>
                                    <span className="text-sm text-muted-foreground">
                                        ({statusTasks.length})
                                    </span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {statusTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {tasks.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Layers className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No tasks yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first task for this project.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href={`/opus/projects/${project.id}/tasks/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Task
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
