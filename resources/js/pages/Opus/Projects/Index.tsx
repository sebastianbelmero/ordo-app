import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    FolderKanban,
    Layers,
    MoreHorizontal,
    Plus,
    Grid3X3,
    List,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

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
    status?: { name: string; color: string; is_completed: boolean };
    priority?: { name: string; color: string; level: number };
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    status?: ProjectStatus;
    tasks?: Task[];
}

interface Workspace {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    color: string;
}

interface ProjectsIndexProps {
    workspace: Workspace;
    projects: {
        data: Project[];
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ProjectGridCard({ project, workspaceColor }: { project: Project; workspaceColor: string }) {
    const taskCount = project.tasks?.length ?? 0;
    const completedTasks = project.tasks?.filter((t) => t.status?.is_completed).length ?? 0;
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    return (
        <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.status && (
                        <span
                            className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
                            style={{ backgroundColor: project.status.color }}
                        >
                            {project.status.name}
                        </span>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/opus/projects/${project.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Progress */}
            <div className="mt-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{completedTasks}/{taskCount} tasks</span>
                    <span className="font-medium">{progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: workspaceColor }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Link href={`/opus/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Details</Button>
                </Link>
                <Link href={`/opus/projects/${project.id}/board`}>
                    <Button size="sm">
                        <Layers className="mr-1 h-3 w-3" />
                        Board
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function ProjectListRow({ project, workspaceColor }: { project: Project; workspaceColor: string }) {
    const taskCount = project.tasks?.length ?? 0;
    const completedTasks = project.tasks?.filter((t) => t.status?.is_completed).length ?? 0;
    const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    return (
        <div className="group flex items-center gap-4 rounded-lg border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 dark:border-sidebar-border">
            <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${workspaceColor}20` }}
            >
                <Layers className="h-5 w-5" style={{ color: workspaceColor }} />
            </div>

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
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {taskCount} tasks
                    </span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {completedTasks} done
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="w-32">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                    <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: workspaceColor }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Link href={`/opus/projects/${project.id}`}>
                    <Button variant="outline" size="sm">Details</Button>
                </Link>
                <Link href={`/opus/projects/${project.id}/board`}>
                    <Button size="sm">Board</Button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProjectsIndex({ workspace, projects }: ProjectsIndexProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: workspace.name, href: `/opus/workspaces/${workspace.id}` },
        { title: 'Projects', href: `/opus/workspaces/${workspace.id}/projects` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Projects - ${workspace.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/opus/workspaces/${workspace.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${workspace.color}20` }}
                        >
                            <FolderKanban className="h-5 w-5" style={{ color: workspace.color }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Projects</h1>
                            <p className="text-muted-foreground">{workspace.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex rounded-lg border p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Total Projects</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">{projects.data.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Active</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">
                            {projects.data.filter((p) => p.status?.slug === 'active').length}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            <span className="text-sm text-muted-foreground">On Hold</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">
                            {projects.data.filter((p) => p.status?.slug === 'on_hold').length}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-slate-500" />
                            <span className="text-sm text-muted-foreground">Archived</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold">
                            {projects.data.filter((p) => p.status?.slug === 'archived').length}
                        </p>
                    </div>
                </div>

                {/* Projects */}
                {projects.data.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project) => (
                                <ProjectGridCard
                                    key={project.id}
                                    project={project}
                                    workspaceColor={workspace.color}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.data.map((project) => (
                                <ProjectListRow
                                    key={project.id}
                                    project={project}
                                    workspaceColor={workspace.color}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
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
