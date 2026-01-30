import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    GraduationCap,
    BookOpen,
    Plus,
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
    courses_count?: number;
}

interface Program {
    id: number;
    user_id: number;
    name: string;
    institution: string;
}

interface SemestersIndexProps {
    program: Program;
    semesters: {
        data: Semester[];
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function SemesterCard({ semester }: { semester: Semester }) {
    return (
        <Link href={`/studium/semesters/${semester.id}`}>
            <div className="group flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            semester.is_active
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-muted'
                        }`}
                    >
                        <BookOpen
                            className={`h-6 w-6 ${
                                semester.is_active ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{semester.name}</h3>
                            {semester.is_active && (
                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Active
                                </span>
                            )}
                        </div>
                        {semester.courses_count !== undefined && (
                            <p className="mt-1 text-sm text-muted-foreground">
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

export default function SemestersIndex({ program, semesters }: SemestersIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: program.name, href: `/studium/programs/${program.id}` },
        { title: 'Semesters', href: `/studium/programs/${program.id}/semesters` },
    ];

    const activeSemester = semesters.data.find((s) => s.is_active);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Semesters - ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/studium/programs/${program.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <GraduationCap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Semesters</h1>
                            <p className="text-muted-foreground">{program.name}</p>
                        </div>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Semester
                    </Button>
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
                                <Button size="sm">View Courses</Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Semesters List */}
                {semesters.data.length > 0 ? (
                    <div className="space-y-3">
                        {semesters.data.map((semester) => (
                            <SemesterCard key={semester.id} semester={semester} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No semesters yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add semesters to organize your courses.
                        </p>
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Semester
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
