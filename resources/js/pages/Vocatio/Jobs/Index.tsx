import { Head, Link } from '@inertiajs/react';
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
    ChevronRight,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    level_of_interest: number;
    salary_min: number | null;
    salary_max: number | null;
    status_id: number;
    pipeline_id: number;
    created_at: string;
    status?: JobStatus;
}

interface Pipeline {
    id: number;
    name: string;
}

interface JobsIndexProps {
    pipeline: Pipeline;
    jobs: {
        data: Job[];
    };
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

function JobRow({ job }: { job: Job }) {
    return (
        <Link href={`/vocatio/jobs/${job.id}`}>
            <div className="group flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm dark:border-sidebar-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-600 dark:bg-slate-800">
                    {job.company.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{job.position}</h3>
                        {job.status && (
                            <span
                                className="rounded-full px-2 py-0.5 text-xs text-white flex-shrink-0"
                                style={{ backgroundColor: job.status.color }}
                            >
                                {job.status.name}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                        </span>
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                            </span>
                        )}
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                    <InterestStars level={job.level_of_interest} />
                    {(job.salary_min || job.salary_max) && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                    )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function JobsIndex({ pipeline, jobs }: JobsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: pipeline.name, href: `/vocatio/pipelines/${pipeline.id}` },
        { title: 'Jobs', href: `/vocatio/pipelines/${pipeline.id}/jobs` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Jobs - ${pipeline.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/vocatio/pipelines/${pipeline.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Briefcase className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Jobs</h1>
                            <p className="text-muted-foreground">
                                {pipeline.name} • {jobs.data.length} jobs
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/vocatio/pipelines/${pipeline.id}/jobs/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Job
                        </Link>
                    </Button>
                </div>

                {/* Jobs List */}
                {jobs.data.length > 0 ? (
                    <div className="space-y-3">
                        {jobs.data.map((job) => (
                            <JobRow key={job.id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No jobs yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add jobs to this pipeline.
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
