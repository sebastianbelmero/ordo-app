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
}

interface Semester {
    id: number;
    program_id: number;
    name: string;
    is_active: boolean;
}

interface CoursesIndexProps {
    semester: Semester;
    courses: {
        data: Course[];
    };
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

function CourseRow({ course }: { course: Course }) {
    const schedule = parseSchedule(course.schedule_data);

    return (
        <Link href={`/studium/courses/${course.id}`}>
            <div className="group flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm dark:border-sidebar-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{course.code}</span>
                        <h3 className="font-semibold">{course.name}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.credits} SKS</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatSchedule(schedule)}
                        </span>
                        {schedule?.room && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {schedule.room}
                            </span>
                        )}
                    </div>
                </div>

                {course.lecturer_name && (
                    <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                        <User className="h-4 w-4" />
                        <span>{course.lecturer_name}</span>
                    </div>
                )}

                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CoursesIndex({ semester, courses }: CoursesIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: semester.name, href: `/studium/semesters/${semester.id}` },
        { title: 'Courses', href: `/studium/semesters/${semester.id}/courses` },
    ];

    const totalCredits = courses.data.reduce((sum, c) => sum + c.credits, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Courses - ${semester.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/studium/semesters/${semester.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                semester.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}
                        >
                            <BookOpen
                                className={`h-6 w-6 ${semester.is_active ? 'text-green-600' : 'text-blue-600'}`}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Courses</h1>
                            <p className="text-muted-foreground">
                                {semester.name} • {courses.data.length} courses • {totalCredits} SKS
                            </p>
                        </div>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Course
                    </Button>
                </div>

                {/* Courses List */}
                {courses.data.length > 0 ? (
                    <div className="space-y-3">
                        {courses.data.map((course) => (
                            <CourseRow key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add your courses for this semester.
                        </p>
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Course
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
