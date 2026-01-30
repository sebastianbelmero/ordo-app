import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Briefcase,
    Plus,
    Building2,
    MapPin,
    ExternalLink,
    DollarSign,
    Star,
    Calendar,
    MoreHorizontal,
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

interface JobStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    is_final: boolean;
}

interface Job {
    id: string;
    company: string;
    position: string;
    url: string | null;
    location: string | null;
    notes: string | null;
    due_date: string | null;
    level_of_interest: number;
    salary_min: number | null;
    salary_max: number | null;
    user_id: number;
    status_id: number;
    pipeline_id: number;
    created_at: string;
    updated_at: string;
    status?: JobStatus;
}

interface Pipeline {
    id: number;
    user_id: number;
    name: string;
    is_default: boolean;
    jobs?: Job[];
}

interface PipelineShowProps {
    pipeline: Pipeline;
}

// =============================================================================
// HELPER
// =============================================================================

function formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return '-';
    const format = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return `Up to ${format(max!)}`;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
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
                    className={`h-4 w-4 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

function JobCard({ job }: { job: Job }) {
    return (
        <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-600 dark:bg-slate-800">
                        {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold">{job.position}</h3>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            {job.company}
                        </p>
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
                            <Link href={`/vocatio/jobs/${job.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Move to...</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Status & Interest */}
            <div className="mt-4 flex items-center justify-between">
                {job.status && (
                    <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: job.status.color }}
                    >
                        {job.status.name}
                    </span>
                )}
                <InterestStars level={job.level_of_interest} />
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm">
                {job.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                    </div>
                )}
                {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>
                )}
                {job.due_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(job.due_date)}</span>
                    </div>
                )}
            </div>

            {/* Notes preview */}
            {job.notes && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.notes}</p>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Link href={`/vocatio/jobs/${job.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                        View Details
                    </Button>
                </Link>
                {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </a>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PipelineShow({ pipeline }: PipelineShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: 'Pipelines', href: '/vocatio/pipelines' },
        { title: pipeline.name, href: `/vocatio/pipelines/${pipeline.id}` },
    ];

    const jobs = pipeline.jobs ?? [];

    // Group by status
    const jobsByStatus = jobs.reduce(
        (acc, job) => {
            const statusName = job.status?.name ?? 'Unknown';
            if (!acc[statusName]) acc[statusName] = [];
            acc[statusName].push(job);
            return acc;
        },
        {} as Record<string, Job[]>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${pipeline.name} - Vocatio`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/vocatio/pipelines">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Briefcase className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{pipeline.name}</h1>
                                {pipeline.is_default && (
                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                )}
                            </div>
                            <p className="text-muted-foreground">{jobs.length} jobs</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/vocatio/pipelines/${pipeline.id}/board`}>
                            <Button variant="outline">Kanban Board</Button>
                        </Link>
                        <Button asChild>
                            <Link href={`/vocatio/pipelines/${pipeline.id}/jobs/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Job
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Jobs by Status */}
                {jobs.length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(jobsByStatus).map(([statusName, statusJobs]) => (
                            <div key={statusName}>
                                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: statusJobs[0].status?.color ?? '#64748b' }}
                                    />
                                    {statusName}
                                    <span className="text-muted-foreground">({statusJobs.length})</span>
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {statusJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No jobs yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add your first job to this pipeline.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href={`/vocatio/pipelines/${pipeline.id}/jobs/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Job
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
