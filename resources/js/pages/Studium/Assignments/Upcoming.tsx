import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Calendar,
    Clock,
    BookOpen,
    ChevronRight,
    AlertTriangle,
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

interface Course {
    id: number;
    name: string;
    code: string;
    semester?: {
        id: number;
        name: string;
        program?: {
            id: number;
            name: string;
        };
    };
}

interface Assignment {
    id: number;
    course_id: number;
    title: string;
    type_id: number;
    deadline: string | null;
    grade: number | null;
    type?: AssignmentType;
    course?: Course;
}

interface UpcomingProps {
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

function getDaysUntil(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyColor(days: number | null): string {
    if (days === null) return 'text-muted-foreground';
    if (days < 0) return 'text-red-500';
    if (days <= 1) return 'text-red-500';
    if (days <= 3) return 'text-amber-500';
    if (days <= 7) return 'text-blue-500';
    return 'text-muted-foreground';
}

function getUrgencyBg(days: number | null): string {
    if (days === null) return 'bg-muted';
    if (days < 0) return 'bg-red-100 dark:bg-red-900/30';
    if (days <= 1) return 'bg-red-100 dark:bg-red-900/30';
    if (days <= 3) return 'bg-amber-100 dark:bg-amber-900/30';
    if (days <= 7) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-muted';
}

// =============================================================================
// COMPONENTS
// =============================================================================

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const days = getDaysUntil(assignment.deadline);
    const urgencyColor = getUrgencyColor(days);
    const urgencyBg = getUrgencyBg(days);

    return (
        <Link href={`/studium/assignments/${assignment.id}`}>
            <div className="group rounded-xl border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md dark:border-sidebar-border">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{assignment.title}</h3>
                            {assignment.type && (
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs text-white"
                                    style={{ backgroundColor: assignment.type.color }}
                                >
                                    {assignment.type.name}
                                </span>
                            )}
                        </div>
                        {assignment.course && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {assignment.course.code} - {assignment.course.name}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm ${urgencyColor}`}>
                        <Calendar className="h-4 w-4" />
                        <span>{formatDeadline(assignment.deadline)}</span>
                    </div>

                    {days !== null && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyBg} ${urgencyColor}`}>
                            {days < 0
                                ? `${Math.abs(days)} days overdue`
                                : days === 0
                                  ? 'Due today!'
                                  : days === 1
                                    ? '1 day left'
                                    : `${days} days left`}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Upcoming({ assignments }: UpcomingProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        { title: 'Upcoming Assignments', href: '/studium/assignments/upcoming' },
    ];

    // Group assignments by urgency
    const overdueAssignments = assignments.data.filter((a) => {
        const days = getDaysUntil(a.deadline);
        return days !== null && days < 0;
    });

    const urgentAssignments = assignments.data.filter((a) => {
        const days = getDaysUntil(a.deadline);
        return days !== null && days >= 0 && days <= 3;
    });

    const thisWeekAssignments = assignments.data.filter((a) => {
        const days = getDaysUntil(a.deadline);
        return days !== null && days > 3 && days <= 7;
    });

    const laterAssignments = assignments.data.filter((a) => {
        const days = getDaysUntil(a.deadline);
        return days === null || days > 7;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upcoming Assignments - Studium" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Upcoming Assignments</h1>
                        <p className="text-muted-foreground">
                            {assignments.data.length} assignments across all courses
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Overdue
                        </div>
                        <p className="mt-1 text-2xl font-bold text-red-500">{overdueAssignments.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Urgent (3 days)
                        </div>
                        <p className="mt-1 text-2xl font-bold text-amber-500">{urgentAssignments.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            This Week
                        </div>
                        <p className="mt-1 text-2xl font-bold text-blue-500">{thisWeekAssignments.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Later
                        </div>
                        <p className="mt-1 text-2xl font-bold">{laterAssignments.length}</p>
                    </div>
                </div>

                {/* Assignments by Group */}
                <div className="space-y-6">
                    {/* Overdue */}
                    {overdueAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold text-red-500">
                                <AlertTriangle className="h-4 w-4" />
                                Overdue ({overdueAssignments.length})
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {overdueAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Urgent */}
                    {urgentAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold text-amber-500">
                                <Clock className="h-4 w-4" />
                                Due in 3 Days ({urgentAssignments.length})
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {urgentAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* This Week */}
                    {thisWeekAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold text-blue-500">
                                <Calendar className="h-4 w-4" />
                                This Week ({thisWeekAssignments.length})
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {thisWeekAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Later */}
                    {laterAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold">
                                <Calendar className="h-4 w-4" />
                                Later ({laterAssignments.length})
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {laterAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {assignments.data.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No upcoming assignments</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            All caught up! No pending assignments.
                        </p>
                        <Link href="/studium/programs">
                            <Button className="mt-4" variant="outline">
                                Go to Programs
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
