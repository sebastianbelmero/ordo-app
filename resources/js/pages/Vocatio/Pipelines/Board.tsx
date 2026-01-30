import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Briefcase,
    Plus,
    Building2,
    MapPin,
    DollarSign,
    Star,
    GripVertical,
    MoreHorizontal,
    List,
    ExternalLink,
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

interface JobStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_final: boolean;
    jobs?: Job[];
}

interface Job {
    id: string;
    company: string;
    position: string;
    url: string | null;
    location: string | null;
    level_of_interest: number;
    salary_min: number | null;
    salary_max: number | null;
    status_id: number;
}

interface Pipeline {
    id: number;
    user_id: number;
    name: string;
    is_default: boolean;
}

interface BoardProps {
    pipeline: Pipeline;
    board: {
        data: JobStatus[];
    };
    statuses: {
        data: JobStatus[];
    };
}

// =============================================================================
// HELPER
// =============================================================================

function formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return '';
    const format = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return `Up to ${format(max!)}`;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function InterestStars({ level }: { level: number }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-3 w-3 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

function JobCardContent({ job }: { job: Job }) {
    return (
        <>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{job.position}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    {job.company}
                </p>
            </div>

            {/* Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <InterestStars level={job.level_of_interest} />
                {job.location && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location.split(',')[0]}
                    </span>
                )}
            </div>

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {formatSalary(job.salary_min, job.salary_max)}
                </div>
            )}
        </>
    );
}

interface SortableJobCardProps {
    job: Job;
    pipelineId: number;
}

function SortableJobCard({ job, pipelineId }: SortableJobCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

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
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                        <JobCardContent job={job} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/vocatio/jobs/${job.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/vocatio/jobs/${job.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                {job.url && (
                                    <DropdownMenuItem asChild>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-3 w-3" />
                                            Open Job URL
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this job?')) {
                                            router.delete(`/vocatio/jobs/${job.id}`);
                                        }
                                    }}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DragOverlayCard({ job }: { job: Job }) {
    return (
        <div className="w-72 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary">
            <div className="flex items-start gap-2">
                <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground/50" />
                <div className="min-w-0 flex-1">
                    <JobCardContent job={job} />
                </div>
            </div>
        </div>
    );
}

interface KanbanColumnProps {
    status: JobStatus;
    jobs: Job[];
    pipelineId: number;
}

function KanbanColumn({ status, jobs, pipelineId }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${status.id}`,
        data: {
            type: 'column',
            statusId: status.id,
        },
    });

    return (
        <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-xl bg-muted/30">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 pb-2">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                    <h3 className="font-semibold">{status.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {jobs.length}
                    </span>
                </div>
                <Link href={`/vocatio/pipelines/${pipelineId}/jobs/create`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Plus className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Cards - Droppable area */}
            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`flex-1 space-y-2 overflow-y-auto p-3 pt-1 transition-colors ${isOver ? 'bg-primary/10' : ''}`}
                    data-status-id={status.id}
                >
                    {jobs.map((job) => (
                        <SortableJobCard key={job.id} job={job} pipelineId={pipelineId} />
                    ))}

                    {/* Empty state / drop zone */}
                    {jobs.length === 0 && (
                        <div className={`flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                            Drop jobs here
                        </div>
                    )}
                </div>
            </SortableContext>

            {/* Add job button */}
            <div className="p-3 pt-1">
                <Link href={`/vocatio/pipelines/${pipelineId}/jobs/create`}>
                    <button className="w-full rounded-lg border-2 border-dashed border-muted-foreground/20 p-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/50">
                        <Plus className="mr-1 inline h-4 w-4" />
                        Add job
                    </button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Board({ pipeline, board }: BoardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: pipeline.name, href: `/vocatio/pipelines/${pipeline.id}` },
        { title: 'Board', href: `/vocatio/pipelines/${pipeline.id}/board` },
    ];

    // Build initial columns state from board data
    const [columns, setColumns] = useState<Record<number, Job[]>>(() => {
        const initial: Record<number, Job[]> = {};
        board.data.forEach((status) => {
            initial[status.id] = (status.jobs ?? []).map(job => ({
                ...job,
                status_id: status.id,
            }));
        });
        return initial;
    });

    const [activeJob, setActiveJob] = useState<Job | null>(null);
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

    // Find which column a job is in
    const findColumn = useCallback((jobId: string): number | null => {
        for (const [statusId, jobs] of Object.entries(columns)) {
            if (jobs.some(j => j.id === jobId)) {
                return parseInt(statusId);
            }
        }
        return null;
    }, [columns]);

    // Find job by ID
    const findJob = useCallback((jobId: string): Job | null => {
        for (const jobs of Object.values(columns)) {
            const job = jobs.find(j => j.id === jobId);
            if (job) return job;
        }
        return null;
    }, [columns]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const job = findJob(active.id as string);
        const columnId = findColumn(active.id as string);
        setActiveJob(job);
        setOriginalStatusId(columnId);
    }, [findJob, findColumn]);

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
            const activeJobs = [...prev[activeColumn]];
            const overJobs = [...prev[overColumn]];

            const activeIndex = activeJobs.findIndex(j => j.id === activeId);
            const [movedJob] = activeJobs.splice(activeIndex, 1);

            // Find position to insert
            const overIndex = overJobs.findIndex(j => j.id === overId);
            if (overIndex >= 0) {
                overJobs.splice(overIndex, 0, { ...movedJob, status_id: overColumn });
            } else {
                overJobs.push({ ...movedJob, status_id: overColumn });
            }

            return {
                ...prev,
                [activeColumn]: activeJobs,
                [overColumn]: overJobs,
            };
        });
    }, [findColumn, columns]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveJob(null);

        if (!over) {
            setOriginalStatusId(null);
            return;
        }

        const activeId = active.id as string;
        const job = findJob(activeId);
        const newStatusId = findColumn(activeId);

        if (!job || !newStatusId) {
            setOriginalStatusId(null);
            return;
        }

        // Only call backend if status actually changed (compare with original)
        if (originalStatusId !== null && originalStatusId !== newStatusId) {
            // Call backend to update status
            router.patch(`/vocatio/jobs/${activeId}/status`, {
                status_id: newStatusId,
            }, {
                preserveScroll: true,
                preserveState: false,
            });
        }

        setOriginalStatusId(null);
    }, [findJob, findColumn, originalStatusId]);

    const totalJobs = Object.values(columns).reduce((acc, jobs) => acc + jobs.length, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Board - ${pipeline.name}`} />

            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Link href={`/vocatio/pipelines/${pipeline.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Briefcase className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">{pipeline.name}</h1>
                                {pipeline.is_default && (
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {totalJobs} jobs across {board.data.length} stages
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/vocatio/pipelines/${pipeline.id}`}>
                            <Button variant="outline" size="sm">
                                <List className="mr-2 h-4 w-4" />
                                List View
                            </Button>
                        </Link>
                        <Link href={`/vocatio/pipelines/${pipeline.id}/jobs/create`}>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Job
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
                            {board.data.map((status) => (
                                <KanbanColumn
                                    key={status.id}
                                    status={status}
                                    jobs={columns[status.id] || []}
                                    pipelineId={pipeline.id}
                                />
                            ))}

                            {/* Add column button */}
                            <div className="flex h-full w-72 flex-shrink-0 items-start">
                                <Link href="/settings/vocatio" className="w-full">
                                    <button className="w-full rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/30">
                                        <Plus className="mr-1 inline h-4 w-4" />
                                        Manage Stages
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeJob ? <DragOverlayCard job={activeJob} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </AppLayout>
    );
}
