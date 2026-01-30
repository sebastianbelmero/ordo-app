import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    GraduationCap,
    Building2,
    Calendar,
    Plus,
    BookOpen,
    ChevronRight,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface Semester {
    id: number;
    program_id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    courses_count?: number;
}

interface Program {
    id: number;
    user_id: number;
    name: string;
    institution: string;
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    semesters?: Semester[];
}

interface ProgramShowProps {
    program: Program;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// =============================================================================
// COMPONENTS
// =============================================================================

function SemesterCard({ semester }: { semester: Semester }) {
    return (
        <Link href={`/studium/semesters/${semester.id}`}>
            <div className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            semester.is_active
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-muted'
                        }`}
                    >
                        <BookOpen
                            className={`h-5 w-5 ${
                                semester.is_active ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium">{semester.name}</h3>
                            {semester.is_active && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                </span>
                            )}
                        </div>
                        {semester.courses_count !== undefined && (
                            <p className="text-sm text-muted-foreground">
                                {semester.courses_count} courses
                            </p>
                        )}
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProgramShow({ program }: ProgramShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: 'Programs', href: '/studium/programs' },
        { title: program.name, href: `/studium/programs/${program.id}` },
    ];

    const semesters = program.semesters ?? [];
    const activeSemester = semesters.find((s) => s.is_active);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${program.name} - Studium`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/studium/programs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{program.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{program.institution}</span>
                        </div>
                    </div>
                    <Link href={`/studium/programs/${program.id}/overview`}>
                        <Button variant="outline">Full Overview</Button>
                    </Link>
                </div>

                {/* Info Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Start Date
                        </div>
                        <p className="mt-1 text-lg font-semibold">{formatDate(program.start_date)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            End Date
                        </div>
                        <p className="mt-1 text-lg font-semibold">{formatDate(program.end_date)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            Semesters
                        </div>
                        <p className="mt-1 text-lg font-semibold">{semesters.length}</p>
                    </div>
                </div>

                {/* Active Semester Highlight */}
                {activeSemester && (
                    <div className="rounded-xl border-2 border-green-500/30 bg-green-50/50 p-4 dark:bg-green-900/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Currently Active</p>
                                    <p className="font-semibold">{activeSemester.name}</p>
                                </div>
                            </div>
                            <Link href={`/studium/semesters/${activeSemester.id}`}>
                                <Button size="sm">View Semester</Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Semesters List */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Semesters</h2>
                        <Button size="sm" asChild>
                            <Link href={`/studium/programs/${program.id}/semesters/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Semester
                            </Link>
                        </Button>
                    </div>

                    {semesters.length > 0 ? (
                        <div className="space-y-3">
                            {semesters.map((semester) => (
                                <SemesterCard key={semester.id} semester={semester} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
                            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                            <h3 className="mt-3 font-medium">No semesters yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add your first semester to this program.
                            </p>
                            <Button className="mt-4" size="sm" asChild>
                                <Link href={`/studium/programs/${program.id}/semesters/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Semester
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
