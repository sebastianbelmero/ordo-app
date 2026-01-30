import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    FolderKanban,
    Layers,
    MoreHorizontal,
    Plus,
    ArrowRight,
    Calendar,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectStatus {
    id: number;
    user_id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
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
    status?: TaskStatus;
    priority?: TaskPriority;
}

interface TaskStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    is_completed: boolean;
}

interface TaskPriority {
    id: number;
    slug: string;
    name: string;
    color: string;
    level: number;
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    status?: ProjectStatus;
    tasks?: Task[];
    tasks_count?: number;
}

interface Workspace {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    color: string;
    projects?: Project[];
}

interface WorkspaceShowProps {
    workspace: Workspace;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ProjectCard({ project, workspaceColor }: { project: Project; workspaceColor: string }) {
    const taskCount = project.tasks?.length ?? project.tasks_count ?? 0;
    const completedTasks = project.tasks?.filter((t) => t.status?.is_completed).length ?? 0;
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    return (
        <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.status && (
                            <span
                                className="rounded-full px-2 py-0.5 text-xs text-white"
                                style={{ backgroundColor: project.status.color }}
                            >
                                {project.status.name}
                            </span>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/opus/projects/${project.id}/edit`}>Edit Project</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Progress */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: workspaceColor,
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>{taskCount} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{completedTasks} done</span>
                </div>
            </div>

            {/* Tasks preview */}
            {project.tasks && project.tasks.length > 0 && (
                <div className="mt-4 space-y-2">
                    {project.tasks.slice(0, 3).map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                        >
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: task.status?.color ?? '#64748b' }}
                            />
                            <span className="flex-1 truncate">{task.title}</span>
                            {task.priority && (
                                <span
                                    className="rounded px-1.5 py-0.5 text-xs"
                                    style={{
                                        backgroundColor: `${task.priority.color}20`,
                                        color: task.priority.color,
                                    }}
                                >
                                    {task.priority.name}
                                </span>
                            )}
                        </div>
                    ))}
                    {project.tasks.length > 3 && (
                        <p className="text-center text-xs text-muted-foreground">
                            +{project.tasks.length - 3} more tasks
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Link href={`/opus/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                        View Details
                    </Button>
                </Link>
                <Link href={`/opus/projects/${project.id}/board`}>
                    <Button variant="default">
                        <Layers className="mr-2 h-4 w-4" />
                        Board
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function WorkspaceShow({ workspace }: WorkspaceShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: 'Workspaces', href: '/opus/workspaces' },
        { title: workspace.name, href: `/opus/workspaces/${workspace.id}` },
    ];

    const projects = workspace.projects ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${workspace.name} - Opus`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/opus/workspaces">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${workspace.color}20` }}
                    >
                        <FolderKanban className="h-6 w-6" style={{ color: workspace.color }} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{workspace.name}</h1>
                        <p className="text-muted-foreground">/{workspace.slug}</p>
                    </div>
                    <Button asChild>
                        <Link href={`/opus/workspaces/${workspace.id}/projects/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Link>
                    </Button>
                </div>

                {/* Stats Bar */}
                <div className="flex gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${workspace.color}20` }}
                        >
                            <Layers className="h-5 w-5" style={{ color: workspace.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{projects.length}</p>
                            <p className="text-sm text-muted-foreground">Projects</p>
                        </div>
                    </div>
                    <div className="h-14 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {projects.reduce((acc, p) => acc + (p.tasks?.filter((t) => t.status?.is_completed).length ?? 0), 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Completed Tasks</p>
                        </div>
                    </div>
                    <div className="h-14 w-px bg-border" />
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {projects.reduce((acc, p) => acc + (p.tasks?.filter((t) => !t.status?.is_completed).length ?? 0), 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Pending Tasks</p>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                {projects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                workspaceColor={workspace.color}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 py-16 dark:border-sidebar-border">
                        <Layers className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first project in this workspace.
                        </p>
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
