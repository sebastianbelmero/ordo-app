import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    ChevronRight,
    Clock,
    MapPin,
    User,
    Mail,
    FileText,
    Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface Schedule {
    day: string;
    start: string;
    end: string;
    room: string;
}

interface Course {
    id: number;
    semester_id: number;
    name: string;
    code: string;
    credits: number;
    schedule_data: string | null;
    lecturer_name: string | null;
    lecturer_contact: string | null;
    assignments_count?: number;
}

interface Semester {
    id: number;
    program_id: number;
    name: string;
    is_active: boolean;
    courses?: Course[];
    program?: {
        id: number;
        name: string;
    };
}

interface SemesterShowProps {
    semester: Semester;
}

// =============================================================================
// HELPER
// =============================================================================

function parseSchedule(scheduleData: string | null): Schedule | null {
    if (!scheduleData) return null;
    try {
        return JSON.parse(scheduleData);
    } catch {
        return null;
    }
}

function formatSchedule(schedule: Schedule | null): string {
    if (!schedule) return 'TBA';
    return `${schedule.day}, ${schedule.start} - ${schedule.end}`;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function CourseCard({ course }: { course: Course }) {
    const schedule = parseSchedule(course.schedule_data);

    return (
        <Link href={`/studium/courses/${course.id}`}>
            <div className="group rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-mono">
                            {course.code}
                        </span>
                        <h3 className="mt-2 font-semibold">{course.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{course.credits} SKS</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatSchedule(schedule)}</span>
                    </div>

                    {/* Room */}
                    {schedule?.room && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{schedule.room}</span>
                        </div>
                    )}

                    {/* Lecturer */}
                    {course.lecturer_name && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{course.lecturer_name}</span>
                        </div>
                    )}
                </div>

                {/* Assignments Count */}
                {course.assignments_count !== undefined && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.assignments_count} assignments</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SemesterShow({ semester }: SemesterShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        ...(semester.program
            ? [{ title: semester.program.name, href: `/studium/programs/${semester.program.id}` }]
            : []),
        { title: semester.name, href: `/studium/semesters/${semester.id}` },
    ];

    const courses = semester.courses ?? [];
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${semester.name} - Studium`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={semester.program ? `/studium/programs/${semester.program.id}` : '/studium/programs'}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                semester.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                            }`}
                        >
                            <BookOpen
                                className={`h-6 w-6 ${semester.is_active ? 'text-green-600' : 'text-purple-600'}`}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{semester.name}</h1>
                                {semester.is_active && (
                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {courses.length} courses • {totalCredits} SKS
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/studium/semesters/${semester.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/studium/semesters/${semester.id}/courses/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Course
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            Courses
                        </div>
                        <p className="mt-1 text-2xl font-bold">{courses.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Total Credits (SKS)
                        </div>
                        <p className="mt-1 text-2xl font-bold">{totalCredits}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Assignments
                        </div>
                        <p className="mt-1 text-2xl font-bold">
                            {courses.reduce((sum, c) => sum + (c.assignments_count ?? 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Courses Grid */}
                {courses.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add your courses for this semester.
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href={`/studium/semesters/${semester.id}/courses/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Course
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
