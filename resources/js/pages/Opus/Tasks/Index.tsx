import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Filter,
    Grid3X3,
    List,
    MoreHorizontal,
    Plus,
    Search,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';

// =============================================================================
// TYPES
// =============================================================================

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
    workspace?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface TasksIndexProps {
    project: Project;
    tasks: {
        data: Task[];
    };
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

function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function isDueSoon(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function TaskGridCard({ task }: { task: Task }) {
    const overdue = !task.status?.is_completed && isOverdue(task.due_date);
    const dueSoon = !task.status?.is_completed && !overdue && isDueSoon(task.due_date);

    return (
        <Link
            href={`/opus/tasks/${task.id}`}
            className="group block rounded-xl border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border"
        >
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
                    <div className="flex-1">
                        <h3
                            className={`font-semibold ${task.status?.is_completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {task.description}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.preventDefault()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {task.status && (
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs text-white"
                        style={{ backgroundColor: task.status.color }}
                    >
                        {task.status.name}
                    </span>
                )}
                {task.priority && (
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs"
                        style={{ backgroundColor: `${task.priority.color}20`, color: task.priority.color }}
                    >
                        {task.priority.name}
                    </span>
                )}
                {task.due_date && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
                            overdue
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : dueSoon
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                    </span>
                )}
            </div>
        </Link>
    );
}

function TaskListRow({ task }: { task: Task }) {
    const overdue = !task.status?.is_completed && isOverdue(task.due_date);
    const dueSoon = !task.status?.is_completed && !overdue && isDueSoon(task.due_date);

    return (
        <Link
            href={`/opus/tasks/${task.id}`}
            className="group flex items-center gap-4 rounded-lg border border-transparent bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
            {task.status?.is_completed ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
            ) : (
                <div
                    className="h-5 w-5 flex-shrink-0 rounded-full border-2"
                    style={{ borderColor: task.status?.color ?? '#64748b' }}
                />
            )}

            <div className="min-w-0 flex-1">
                <h4
                    className={`truncate font-medium ${task.status?.is_completed ? 'line-through text-muted-foreground' : ''}`}
                >
                    {task.title}
                </h4>
                {task.description && (
                    <p className="truncate text-sm text-muted-foreground">{task.description}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {task.status && (
                    <span
                        className="hidden rounded-full px-2.5 py-0.5 text-xs text-white sm:inline-flex"
                        style={{ backgroundColor: task.status.color }}
                    >
                        {task.status.name}
                    </span>
                )}
                {task.priority && (
                    <span
                        className="hidden rounded-full px-2.5 py-0.5 text-xs sm:inline-flex"
                        style={{ backgroundColor: `${task.priority.color}20`, color: task.priority.color }}
                    >
                        {task.priority.name}
                    </span>
                )}
                {task.due_date && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
                            overdue
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : dueSoon
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                    </span>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.preventDefault()}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Link>
    );
}

function EmptyState({ projectName }: { projectName: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 py-16">
            <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
                Get started by creating your first task in {projectName}
            </p>
            <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Task
            </Button>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TasksIndex({ project, tasks }: TasksIndexProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

    const filteredTasks = useMemo(() => {
        let filtered = tasks.data;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }

        // Filter by status
        if (statusFilter === 'active') {
            filtered = filtered.filter((task) => !task.status?.is_completed);
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter((task) => task.status?.is_completed);
        }

        return filtered;
    }, [tasks.data, searchQuery, statusFilter]);

    // Stats
    const totalTasks = tasks.data.length;
    const completedTasks = tasks.data.filter((t) => t.status?.is_completed).length;
    const activeTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.data.filter(
        (t) => !t.status?.is_completed && isOverdue(t.due_date)
    ).length;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: project.workspace?.name ?? 'Workspace', href: `/opus/workspaces/${project.workspace_id}` },
        { title: project.name, href: `/opus/projects/${project.id}` },
        { title: 'Tasks', href: `/opus/projects/${project.id}/tasks` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tasks - ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/opus/projects/${project.id}`}
                            className="rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{project.name} - Tasks</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage and track all tasks in this project
                            </p>
                        </div>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span className="text-sm">Total</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold">{totalTasks}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-blue-600">{activeTasks}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Completed</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-green-600">{completedTasks}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Overdue</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-red-600">{overdueTasks}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    {statusFilter === 'all'
                                        ? 'All'
                                        : statusFilter === 'active'
                                          ? 'Active'
                                          : 'Completed'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                    All Tasks
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                                    Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                                    Completed
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {filteredTasks.length === 0 ? (
                    tasks.data.length === 0 ? (
                        <EmptyState projectName={project.name} />
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 py-16">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTasks.map((task) => (
                            <TaskGridCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredTasks.map((task) => (
                            <TaskListRow key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
