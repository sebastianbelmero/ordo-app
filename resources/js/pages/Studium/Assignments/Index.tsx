import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    ChevronRight,
    Calendar,
    CheckCircle2,
    Clock,
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
    name: string;
    code: string;
}

interface AssignmentsIndexProps {
    course: Course;
    assignments: {
        data: Assignment[];
    };
}

// =============================================================================
// HELPER
// =============================================================================

function formatDeadline(deadline: string | null): string {
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString('id-ID', {
        weekday: 'short',
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
        <Link href={`/studium/assignments/${assignment.id}`}>
            <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
                {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                    <div
                        className={`h-5 w-5 rounded-full border-2 ${
                            overdue ? 'border-red-500' : 'border-muted-foreground'
                        }`}
                    />
                )}

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                            {assignment.title}
                        </h3>
                        {assignment.type && (
                            <span
                                className="rounded-full px-2 py-0.5 text-xs text-white"
                                style={{ backgroundColor: assignment.type.color }}
                            >
                                {assignment.type.name}
                            </span>
                        )}
                    </div>
                    {assignment.deadline && (
                        <p
                            className={`mt-1 flex items-center gap-1 text-sm ${
                                overdue ? 'text-red-500' : 'text-muted-foreground'
                            }`}
                        >
                            <Calendar className="h-3 w-3" />
                            {formatDeadline(assignment.deadline)}
                        </p>
                    )}
                </div>

                {completed && (
                    <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {assignment.grade}
                    </span>
                )}

                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AssignmentsIndex({ course, assignments }: AssignmentsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: course.name, href: `/studium/courses/${course.id}` },
        { title: 'Assignments', href: `/studium/courses/${course.id}/assignments` },
    ];

    const completedCount = assignments.data.filter((a) => a.grade !== null).length;
    const pendingCount = assignments.data.filter((a) => !a.grade).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assignments - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/studium/courses/${course.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Assignments</h1>
                            <p className="text-muted-foreground">
                                {course.code} - {course.name}
                            </p>
                        </div>
                    </div>
                    <Link href={`/studium/courses/${course.id}/assignments/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Assignment
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            Total
                        </div>
                        <p className="mt-1 text-2xl font-bold">{assignments.data.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Pending
                        </div>
                        <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Completed
                        </div>
                        <p className="mt-1 text-2xl font-bold text-green-600">{completedCount}</p>
                    </div>
                </div>

                {/* Assignments List */}
                {assignments.data.length > 0 ? (
                    <div className="space-y-3">
                        {assignments.data.map((assignment) => (
                            <AssignmentRow key={assignment.id} assignment={assignment} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No assignments yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Add assignments for this course.
                        </p>
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Assignment
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
