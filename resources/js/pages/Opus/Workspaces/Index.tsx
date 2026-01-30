import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    FolderKanban,
    Plus,
    MoreHorizontal,
    ArrowRight,
    Layers,
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

interface TaskStatus {
    id: number;
    user_id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
    is_completed: boolean;
}

interface TaskPriority {
    id: number;
    user_id: number;
    slug: string;
    name: string;
    color: string;
    level: number;
    is_system: boolean;
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    status?: ProjectStatus;
    tasks_count?: number;
}

interface Workspace {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    color: string;
    projects?: Project[];
    projects_count?: number;
}

interface StatusConfig {
    project_statuses: ProjectStatus[];
    task_statuses: TaskStatus[];
    task_priorities: TaskPriority[];
}

interface WorkspacesIndexProps {
    workspaces: {
        data: Workspace[];
    };
    statusConfig: StatusConfig;
}

// =============================================================================
// BREADCRUMBS
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Opus',
        href: '/opus/workspaces',
    },
    {
        title: 'Workspaces',
        href: '/opus/workspaces',
    },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
    const projectCount = workspace.projects?.length ?? workspace.projects_count ?? 0;

    return (
        <div className="group relative rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            {/* Color indicator */}
            <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                style={{ backgroundColor: workspace.color }}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${workspace.color}20` }}
                    >
                        <FolderKanban className="h-5 w-5" style={{ color: workspace.color }} />
                    </div>
                    <div>
                        <h3 className="font-semibold">{workspace.name}</h3>
                        <p className="text-sm text-muted-foreground">/{workspace.slug}</p>
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
                            <Link href={`/opus/workspaces/${workspace.id}/edit`}>
                                Edit Workspace
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>{projectCount} projects</span>
                </div>
            </div>

            {/* Projects preview */}
            {workspace.projects && workspace.projects.length > 0 && (
                <div className="mt-4 space-y-2">
                    {workspace.projects.slice(0, 3).map((project) => (
                        <div
                            key={project.id}
                            className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                        >
                            <span className="truncate">{project.name}</span>
                            {project.status && (
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs text-white"
                                    style={{ backgroundColor: project.status.color }}
                                >
                                    {project.status.name}
                                </span>
                            )}
                        </div>
                    ))}
                    {workspace.projects.length > 3 && (
                        <p className="text-center text-xs text-muted-foreground">
                            +{workspace.projects.length - 3} more projects
                        </p>
                    )}
                </div>
            )}

            {/* Action */}
            <div className="mt-4">
                <Link href={`/opus/workspaces/${workspace.id}`}>
                    <Button variant="outline" className="w-full group/btn">
                        <span>View Workspace</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function StatusConfigPanel({ statusConfig }: { statusConfig: StatusConfig }) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
            <h3 className="mb-4 font-semibold">Status Configuration</h3>

            {/* Project Statuses */}
            <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Project Statuses</p>
                <div className="flex flex-wrap gap-2">
                    {statusConfig.project_statuses.map((status) => (
                        <span
                            key={status.id}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
                            style={{ backgroundColor: status.color }}
                        >
                            {status.name}
                            {status.is_system && (
                                <span className="ml-1 opacity-70">•</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* Task Statuses (Kanban Columns) */}
            <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Task Statuses (Columns)</p>
                <div className="flex flex-wrap gap-2">
                    {statusConfig.task_statuses.map((status) => (
                        <span
                            key={status.id}
                            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                            style={{
                                borderColor: status.color,
                                color: status.color,
                            }}
                        >
                            {status.name}
                            {status.is_completed && ' ✓'}
                        </span>
                    ))}
                </div>
            </div>

            {/* Task Priorities */}
            <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Task Priorities</p>
                <div className="flex flex-wrap gap-2">
                    {statusConfig.task_priorities.map((priority) => (
                        <span
                            key={priority.id}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                            style={{
                                backgroundColor: `${priority.color}20`,
                                color: priority.color,
                            }}
                        >
                            {priority.name}
                            <span className="text-[10px] opacity-70">L{priority.level}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function WorkspacesIndex({ workspaces, statusConfig }: WorkspacesIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspaces - Opus" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Workspaces</h1>
                        <p className="text-muted-foreground">
                            Manage your project workspaces
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/opus/workspaces/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Workspace
                        </Link>
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Workspaces Grid */}
                    <div className="lg:col-span-2">
                        {workspaces.data.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {workspaces.data.map((workspace) => (
                                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 py-16 dark:border-sidebar-border">
                                <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No workspaces yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Create your first workspace to start organizing projects.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/opus/workspaces/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Workspace
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Status Config */}
                    <div className="lg:col-span-1">
                        <StatusConfigPanel statusConfig={statusConfig} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
