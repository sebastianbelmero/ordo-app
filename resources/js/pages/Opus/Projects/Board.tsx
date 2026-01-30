import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Calendar,
    GripVertical,
    MoreHorizontal,
    Plus,
    List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
}

interface TaskStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_completed: boolean;
    tasks?: Task[];
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
    priority?: TaskPriority;
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    status?: ProjectStatus;
}

interface StatusConfig {
    project_statuses: ProjectStatus[];
    task_statuses: TaskStatus[];
    task_priorities: TaskPriority[];
}

interface BoardProps {
    project: Project;
    board: {
        data: TaskStatus[];
    };
    statusConfig: StatusConfig;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

function isOverdue(dueDate: string | null, isCompleted: boolean): boolean {
    if (!dueDate || isCompleted) return false;
    return new Date(dueDate) < new Date();
}

// =============================================================================
// COMPONENTS
// =============================================================================

function TaskCardContent({
    task,
    isCompleted,
}: {
    task: Task;
    isCompleted: boolean;
}) {
    const overdue = isOverdue(task.due_date, isCompleted);

    return (
        <>
            <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
            </p>

            {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Priority */}
                    {task.priority && (
                        <span
                            className="inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium"
                            style={{
                                backgroundColor: `${task.priority.color}20`,
                                color: task.priority.color,
                            }}
                        >
                            {task.priority.name}
                        </span>
                    )}
                </div>

                {/* Due date */}
                {task.due_date && (
                    <span
                        className={`inline-flex items-center gap-1 text-[10px] ${
                            overdue ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                    >
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                    </span>
                )}
            </div>
        </>
    );
}

interface SortableTaskCardProps {
    task: Task;
    isCompleted: boolean;
    projectId: number;
}

function SortableTaskCard({ task, isCompleted, projectId }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md ${isDragging ? 'ring-2 ring-primary' : ''}`}
        >
            <div className="flex items-start gap-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-0.5 cursor-grab touch-none active:cursor-grabbing"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex-1 min-w-0">
                    <TaskCardContent task={task} isCompleted={isCompleted} />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                            <MoreHorizontal className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/opus/tasks/${task.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/opus/tasks/${task.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                router.patch(`/opus/tasks/${task.id}/toggle-complete`);
                            }}
                        >
                            {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                    router.delete(`/opus/tasks/${task.id}`);
                                }
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function DragOverlayCard({ task, isCompleted }: { task: Task; isCompleted: boolean }) {
    return (
        <div className="w-80 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary">
            <div className="flex items-start gap-2">
                <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground/50" />
                <div className="flex-1 min-w-0">
                    <TaskCardContent task={task} isCompleted={isCompleted} />
                </div>
            </div>
        </div>
    );
}

interface KanbanColumnProps {
    column: TaskStatus;
    tasks: Task[];
    projectId: number;
}

function KanbanColumn({ column, tasks, projectId }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: {
            type: 'column',
            statusId: column.id,
        },
    });

    return (
        <div className="flex h-full w-80 flex-shrink-0 flex-col rounded-xl bg-muted/30">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 pb-2">
                <div className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold">{column.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {tasks.length}
                    </span>
                </div>
                <Link href={`/opus/projects/${projectId}/tasks/create`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Plus className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Cards - Droppable area */}
            <SortableContext items={tasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`flex-1 space-y-2 overflow-y-auto p-3 pt-1 transition-colors ${isOver ? 'bg-primary/10' : ''}`}
                    data-status-id={column.id}
                >
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            isCompleted={column.is_completed}
                            projectId={projectId}
                        />
                    ))}

                    {/* Empty state / drop zone */}
                    {tasks.length === 0 && (
                        <div className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                            Drop tasks here
                        </div>
                    )}
                </div>
            </SortableContext>

            {/* Add card button */}
            <div className="p-3 pt-1">
                <Link href={`/opus/projects/${projectId}/tasks/create`}>
                    <button className="w-full rounded-lg border-2 border-dashed border-muted-foreground/20 p-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/50">
                        <Plus className="mr-1 inline h-4 w-4" />
                        Add task
                    </button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Board({ project, board, statusConfig }: BoardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: project.name, href: `/opus/projects/${project.id}` },
        { title: 'Board', href: `/opus/projects/${project.id}/board` },
    ];

    // Build initial columns state from board data
    const [columns, setColumns] = useState<Record<number, Task[]>>(() => {
        const initial: Record<number, Task[]> = {};
        board.data.forEach((status) => {
            initial[status.id] = (status.tasks ?? []).map(task => ({
                ...task,
                status_id: status.id,
            }));
        });
        return initial;
    });

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumnCompleted, setActiveColumnCompleted] = useState(false);
    const [originalStatusId, setOriginalStatusId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Find which column a task is in
    const findColumn = useCallback((taskId: string): number | null => {
        for (const [statusId, tasks] of Object.entries(columns)) {
            if (tasks.some(t => t.id.toString() === taskId)) {
                return parseInt(statusId);
            }
        }
        return null;
    }, [columns]);

    // Find task by ID
    const findTask = useCallback((taskId: string): Task | null => {
        for (const tasks of Object.values(columns)) {
            const task = tasks.find(t => t.id.toString() === taskId);
            if (task) return task;
        }
        return null;
    }, [columns]);

    // Check if column is completed
    const isColumnCompleted = useCallback((statusId: number): boolean => {
        const status = board.data.find(s => s.id === statusId);
        return status?.is_completed ?? false;
    }, [board.data]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const task = findTask(active.id as string);
        const columnId = findColumn(active.id as string);
        setActiveTask(task);
        setOriginalStatusId(columnId);
        setActiveColumnCompleted(columnId ? isColumnCompleted(columnId) : false);
    }, [findTask, findColumn, isColumnCompleted]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumn(activeId);
        let overColumn = findColumn(overId);

        // If dropping over a column (empty column droppable area)
        if (!overColumn && overId.startsWith('column-')) {
            const columnStatusId = parseInt(overId.replace('column-', ''));
            if (!isNaN(columnStatusId) && columns[columnStatusId] !== undefined) {
                overColumn = columnStatusId;
            }
        }

        // If dropping over a column header (status id), use that
        if (!overColumn) {
            const parsedId = parseInt(overId);
            if (!isNaN(parsedId) && columns[parsedId]) {
                overColumn = parsedId;
            }
        }

        if (!activeColumn || !overColumn || activeColumn === overColumn) return;

        setColumns((prev) => {
            const activeTasks = [...prev[activeColumn]];
            const overTasks = [...prev[overColumn]];

            const activeIndex = activeTasks.findIndex(t => t.id.toString() === activeId);
            const [movedTask] = activeTasks.splice(activeIndex, 1);

            // Find position to insert
            const overIndex = overTasks.findIndex(t => t.id.toString() === overId);
            if (overIndex >= 0) {
                overTasks.splice(overIndex, 0, { ...movedTask, status_id: overColumn });
            } else {
                overTasks.push({ ...movedTask, status_id: overColumn });
            }

            return {
                ...prev,
                [activeColumn]: activeTasks,
                [overColumn]: overTasks,
            };
        });
    }, [findColumn, columns]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        setActiveColumnCompleted(false);

        if (!over) {
            setOriginalStatusId(null);
            return;
        }

        const activeId = active.id as string;
        const task = findTask(activeId);
        const newStatusId = findColumn(activeId);

        if (!task || !newStatusId) {
            setOriginalStatusId(null);
            return;
        }

        // Only call backend if status actually changed (compare with original)
        if (originalStatusId !== null && originalStatusId !== newStatusId) {
            // Call backend to update status
            router.patch(`/opus/tasks/${task.id}/status`, {
                status_id: newStatusId,
            }, {
                preserveScroll: true,
                preserveState: false, // Allow state refresh but we already have correct local state
            });
        }

        setOriginalStatusId(null);
    }, [findTask, findColumn, originalStatusId]);

    const totalTasks = Object.values(columns).reduce((acc, tasks) => acc + tasks.length, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Board - ${project.name}`} />

            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link href={`/opus/projects/${project.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold">{project.name}</h1>
                                {project.status && (
                                    <span
                                        className="rounded-full px-2 py-0.5 text-xs text-white"
                                        style={{ backgroundColor: project.status.color }}
                                    >
                                        {project.status.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {totalTasks} tasks across {board.data.length} columns
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/opus/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                                <List className="mr-2 h-4 w-4" />
                                List View
                            </Button>
                        </Link>
                        <Link href={`/opus/projects/${project.id}/tasks/create`}>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                New Task
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Kanban Board with DnD */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 overflow-x-auto p-4">
                        <div className="flex h-full gap-4">
                            {board.data.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    tasks={columns[column.id] || []}
                                    projectId={project.id}
                                />
                            ))}

                            {/* Add column button */}
                            <div className="flex h-full w-80 flex-shrink-0 items-start">
                                <Link href="/settings/opus" className="w-full">
                                    <button className="w-full rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/30">
                                        <Plus className="mr-1 inline h-4 w-4" />
                                        Manage Columns
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeTask ? (
                            <DragOverlayCard task={activeTask} isCompleted={activeColumnCompleted} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </AppLayout>
    );
}
