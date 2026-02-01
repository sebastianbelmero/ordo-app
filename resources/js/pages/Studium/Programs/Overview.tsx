import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    GraduationCap,
    Building2,
    BookOpen,
    FileText,
    CheckCircle2,
    Clock,
    Calendar,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface AssignmentType {
    id: number;
    slug: string;
    name: string;
    color: string;
}

interface Assignment {
    id: number;
    course_id: number;
    title: string;
    type_id: number;
    deadline: string | null;
    grade: number | null;
    type?: AssignmentType;
}

interface Course {
    id: number;
    semester_id: number;
    name: string;
    code: string;
    credits: number;
    schedule_data: string | null;
    lecturer_name: string | null;
    assignments?: Assignment[];
}

interface Semester {
    id: number;
    program_id: number;
    name: string;
    is_active: boolean;
    courses?: Course[];
}

interface Program {
    id: number;
    user_id: number;
    name: string;
    institution: string;
    start_date: string;
    end_date: string | null;
    semesters?: Semester[];
}

interface ProgramOverviewProps {
    program: Program;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDeadline(deadline: string | null): string {
    if (!deadline) return '-';
    return new Date(deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function isOverdue(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

// =============================================================================
// COMPONENTS
// =============================================================================

function AssignmentRow({ assignment }: { assignment: Assignment }) {
    const overdue = !assignment.grade && isOverdue(assignment.deadline);
    const completed = assignment.grade !== null;

    return (
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            {completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <Clock className={`h-4 w-4 ${overdue ? 'text-red-500' : 'text-muted-foreground'}`} />
            )}
            <span className={`flex-1 text-sm ${completed ? 'text-muted-foreground line-through' : ''}`}>
                {assignment.title}
            </span>
            {assignment.type && (
                <span
                    className="rounded px-1.5 py-0.5 text-xs text-white"
                    style={{ backgroundColor: assignment.type.color }}
                >
                    {assignment.type.name}
                </span>
            )}
            {assignment.grade !== null ? (
                <span className="text-sm font-medium text-green-600">{assignment.grade}</span>
            ) : assignment.deadline ? (
                <span className={`text-xs ${overdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {formatDeadline(assignment.deadline)}
                </span>
            ) : null}
        </div>
    );
}

function CourseCard({ course }: { course: Course }) {
    const assignments = course.assignments ?? [];
    const completedCount = assignments.filter((a) => a.grade !== null).length;

    return (
        <div className="rounded-lg border bg-card">
            <Link href={`/studium/courses/${course.id}`}>
                <div className="flex items-center justify-between border-b p-4 hover:bg-muted/30">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                                {course.code}
                            </span>
                            <h4 className="font-medium">{course.name}</h4>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {course.credits} SKS • {course.lecturer_name ?? 'TBA'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {completedCount}/{assignments.length}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </Link>

            {assignments.length > 0 && (
                <div className="space-y-2 p-3">
                    {assignments.slice(0, 3).map((assignment) => (
                        <AssignmentRow key={assignment.id} assignment={assignment} />
                    ))}
                    {assignments.length > 3 && (
                        <Link href={`/studium/courses/${course.id}`}>
                            <p className="text-center text-xs text-primary hover:underline">
                                +{assignments.length - 3} more assignments
                            </p>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

function SemesterSection({ semester }: { semester: Semester }) {
    const courses = semester.courses ?? [];
    const totalCredits = courses.reduce((sum, c) => sum + Number(c.credits), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        semester.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
                    }`}
                >
                    <BookOpen
                        className={`h-4 w-4 ${semester.is_active ? 'text-green-600' : 'text-muted-foreground'}`}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{semester.name}</h3>
                        {semester.is_active && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {courses.length} courses • {totalCredits} SKS
                    </p>
                </div>
                <Link href={`/studium/semesters/${semester.id}`}>
                    <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {courses.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                    No courses in this semester
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProgramOverview({ program }: ProgramOverviewProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: program.name, href: `/studium/programs/${program.id}` },
        { title: 'Overview', href: `/studium/programs/${program.id}/overview` },
    ];

    const semesters = program.semesters ?? [];
    const totalCourses = semesters.reduce((sum, s) => sum + (s.courses?.length ?? 0), 0);
    const totalAssignments = semesters.reduce(
        (sum, s) => sum + (s.courses?.reduce((cSum, c) => cSum + (c.assignments?.length ?? 0), 0) ?? 0),
        0
    );
    const completedAssignments = semesters.reduce(
        (sum, s) =>
            sum + (s.courses?.reduce((cSum, c) => cSum + (c.assignments?.filter((a) => a.grade !== null).length ?? 0), 0) ?? 0),
        0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Overview - ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
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
                        <h1 className="text-2xl font-bold">{program.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{program.institution}</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            Semesters
                        </div>
                        <p className="mt-1 text-2xl font-bold">{semesters.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            Courses
                        </div>
                        <p className="mt-1 text-2xl font-bold">{totalCourses}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Assignments
                        </div>
                        <p className="mt-1 text-2xl font-bold">{totalAssignments}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Completed
                        </div>
                        <p className="mt-1 text-2xl font-bold text-green-600">
                            {completedAssignments}/{totalAssignments}
                        </p>
                    </div>
                </div>

                {/* Semesters */}
                <div className="space-y-8">
                    {semesters.map((semester) => (
                        <SemesterSection key={semester.id} semester={semester} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
