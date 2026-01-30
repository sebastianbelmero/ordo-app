import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Briefcase,
    Plus,
    ChevronRight,
    MoreHorizontal,
    Star,
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

interface Pipeline {
    id: number;
    user_id: number;
    name: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    jobs_count?: number;
}

interface PipelinesIndexProps {
    pipelines: {
        data: Pipeline[];
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
    return (
        <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Briefcase className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{pipeline.name}</h3>
                            {pipeline.is_default && (
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {pipeline.jobs_count ?? 0} jobs
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
                            <Link href={`/vocatio/pipelines/${pipeline.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Set as Default</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Link href={`/vocatio/pipelines/${pipeline.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                        View Jobs
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
                <Link href={`/vocatio/pipelines/${pipeline.id}/board`}>
                    <Button>Board</Button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PipelinesIndex({ pipelines }: PipelinesIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: 'Pipelines', href: '/vocatio/pipelines' },
    ];

    const totalJobs = pipelines.data.reduce((sum, p) => sum + (p.jobs_count ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pipelines - Vocatio" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Briefcase className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Pipelines</h1>
                            <p className="text-muted-foreground">
                                {pipelines.data.length} pipelines • {totalJobs} total jobs
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/vocatio/pipelines/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Pipeline
                        </Link>
                    </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Link href="/vocatio/jobs">
                        <Button variant="outline">View All Jobs</Button>
                    </Link>
                    <Link href="/vocatio/shares">
                        <Button variant="outline">Shared Jobs</Button>
                    </Link>
                </div>

                {/* Pipelines Grid */}
                {pipelines.data.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pipelines.data.map((pipeline) => (
                            <PipelineCard key={pipeline.id} pipeline={pipeline} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No pipelines yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first pipeline to start tracking jobs.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href="/vocatio/pipelines/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Pipeline
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
