import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    ExternalLink,
    Flag,
    MessageSquare,
    Paperclip,
    RotateCcw,
    Tag,
    Trash2,
    User,
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

interface Project {
    id: number;
    workspace_id: number;
    name: string;
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
    project?: Project;
}

interface StatusConfig {
    task_statuses: TaskStatus[];
    task_priorities: TaskPriority[];
}

interface TaskShowProps {
    task: Task;
    statusConfig: StatusConfig;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function getDaysUntilDue(dueDate: string | null): number | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface TaskMeta {
    tags?: string[];
    checklist?: { text: string; done: boolean }[];
    attachments?: { name: string; url: string }[];
    comments?: { user: string; text: string; date: string }[];
}

function parseMeta(meta: string | null): TaskMeta | null {
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

function ChecklistItem({ item }: { item: { text: string; done: boolean } }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
            <input
                type="checkbox"
                checked={item.done}
                readOnly
                className="h-4 w-4 rounded border-muted-foreground/50"
            />
            <span className={item.done ? 'line-through text-muted-foreground' : ''}>
                {item.text}
            </span>
        </label>
    );
}

function StatusBadge({ status }: { status: TaskStatus }) {
    return (
        <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: status.color }}
        >
            {status.is_completed && <CheckCircle2 className="h-4 w-4" />}
            {status.name}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
    return (
        <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
        >
            <Flag className="h-4 w-4" />
            {priority.name}
        </span>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TaskShow({ task, statusConfig }: TaskShowProps) {
    const meta = parseMeta(task.meta);
    const overdue = !task.status?.is_completed && isOverdue(task.due_date);
    const daysUntilDue = getDaysUntilDue(task.due_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: task.project?.name ?? 'Project', href: `/opus/projects/${task.project_id}` },
        { title: task.title, href: `/opus/tasks/${task.id}` },
    ];

    // Calculate checklist progress
    const checklistTotal = meta?.checklist?.length ?? 0;
    const checklistDone = meta?.checklist?.filter((c) => c.done).length ?? 0;
    const checklistProgress = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${task.title} - Opus`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Link href={`/opus/projects/${task.project_id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                {task.status?.is_completed ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <div
                                        className="h-6 w-6 rounded-full border-2"
                                        style={{ borderColor: task.status?.color ?? '#64748b' }}
                                    />
                                )}
                                <h1
                                    className={`text-2xl font-bold ${task.status?.is_completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                    {task.title}
                                </h1>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                {task.status && <StatusBadge status={task.status} />}
                                {task.priority && <PriorityBadge priority={task.priority} />}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/opus/tasks/${task.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Task
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.patch(`/opus/tasks/${task.id}/toggle-complete`)}>
                                {task.status?.is_completed ? (
                                    <>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Mark as Pending
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Mark as Complete
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="font-semibold">Description</h2>
                            {task.description ? (
                                <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                                    {task.description}
                                </p>
                            ) : (
                                <p className="mt-3 italic text-muted-foreground">No description provided</p>
                            )}
                        </div>

                        {/* Checklist */}
                        {meta?.checklist && meta.checklist.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold">Checklist</h2>
                                    <span className="text-sm text-muted-foreground">
                                        {checklistDone}/{checklistTotal} completed
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all"
                                            style={{ width: `${checklistProgress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                    {meta.checklist.map((item, index) => (
                                        <ChecklistItem key={index} item={item} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {meta?.tags && meta.tags.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="font-semibold">Tags</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {meta.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        >
                                            <Tag className="h-3 w-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {meta?.attachments && meta.attachments.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="font-semibold">Attachments</h2>
                                <div className="mt-3 space-y-2">
                                    {meta.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                                        >
                                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1">{attachment.name}</span>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        {meta?.comments && meta.comments.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    <MessageSquare className="h-4 w-4" />
                                    Comments ({meta.comments.length})
                                </h2>
                                <div className="mt-4 space-y-4">
                                    {meta.comments.map((comment, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{comment.user}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {comment.date}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Due Date */}
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                            {task.due_date ? (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{formatDate(task.due_date)}</span>
                                    </div>
                                    {!task.status?.is_completed && daysUntilDue !== null && (
                                        <p
                                            className={`mt-1 text-sm ${
                                                overdue
                                                    ? 'text-red-600'
                                                    : daysUntilDue <= 3
                                                      ? 'text-amber-600'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {overdue
                                                ? `${Math.abs(daysUntilDue)} days overdue`
                                                : daysUntilDue === 0
                                                  ? 'Due today'
                                                  : daysUntilDue === 1
                                                    ? 'Due tomorrow'
                                                    : `${daysUntilDue} days left`}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-muted-foreground">No due date set</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: task.status?.color }}
                                />
                                <span className="font-medium">{task.status?.name ?? '-'}</span>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <Flag className="h-4 w-4" style={{ color: task.priority?.color }} />
                                <span className="font-medium">{task.priority?.name ?? '-'}</span>
                            </div>
                        </div>

                        {/* Project */}
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                            <Link
                                href={`/opus/projects/${task.project_id}`}
                                className="mt-2 flex items-center gap-2 text-primary hover:underline"
                            >
                                {task.project?.name ?? 'View Project'}
                            </Link>
                        </div>

                        {/* Timestamps */}
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Created {formatDateTime(task.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Edit className="h-4 w-4" />
                                    <span>Updated {formatDateTime(task.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
