import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    GraduationCap,
    Plus,
    Building2,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    BookOpen,
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

interface Program {
    id: number;
    user_id: number;
    name: string;
    institution: string;
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    semesters_count?: number;
}

interface ProgramsIndexProps {
    programs: {
        data: Program[];
    };
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Sekarang';
    return new Date(dateString).toLocaleDateString('id-ID', {
        month: 'short',
        year: 'numeric',
    });
}

function getProgramStatus(startDate: string, endDate: string | null): { label: string; color: string } {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (now < start) {
        return { label: 'Upcoming', color: '#3b82f6' };
    }
    if (end && now > end) {
        return { label: 'Completed', color: '#22c55e' };
    }
    return { label: 'Active', color: '#f59e0b' };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ProgramCard({ program }: { program: Program }) {
    const status = getProgramStatus(program.start_date, program.end_date);

    return (
        <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{program.institution}</span>
                        </div>
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
                            <Link href={`/studium/programs/${program.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Status & Duration */}
            <div className="mt-4 flex items-center gap-4">
                <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: status.color }}
                >
                    {status.label}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(program.start_date)} - {formatDate(program.end_date)}
                </span>
            </div>

            {/* Stats */}
            {program.semesters_count !== undefined && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{program.semesters_count} semesters</span>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
                <Link href={`/studium/programs/${program.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
                <Link href={`/studium/programs/${program.id}/overview`}>
                    <Button>Overview</Button>
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProgramsIndex({ programs }: ProgramsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: 'Programs', href: '/studium/programs' },
    ];

    const activePrograms = programs.data.filter((p) => {
        const status = getProgramStatus(p.start_date, p.end_date);
        return status.label === 'Active';
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs - Studium" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <GraduationCap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Programs</h1>
                            <p className="text-muted-foreground">
                                {activePrograms.length} active programs
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/studium/programs/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Program
                        </Link>
                    </Button>
                </div>

                {/* Programs Grid */}
                {programs.data.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {programs.data.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No programs yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add your academic programs to get started.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href="/studium/programs/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Program
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
