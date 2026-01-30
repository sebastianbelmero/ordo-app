import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    ExternalLink,
    RotateCcw,
    Trash2,
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
}

interface Assignment {
    id: number;
    course_id: number;
    title: string;
    type_id: number;
    deadline: string | null;
    grade: number | null;
    gcal_event_id: string | null;
    created_at: string;
    updated_at: string;
    type?: AssignmentType;
    course?: Course;
}

interface AssignmentShowProps {
    assignment: Assignment;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDeadline(deadline: string | null): string {
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function isOverdue(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

function getDaysUntil(deadline: string | null): { value: number; label: string } | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
        return { value: Math.abs(days), label: 'days overdue' };
    } else if (days === 0) {
        return { value: 0, label: 'Due today' };
    } else if (days === 1) {
        return { value: 1, label: 'day left' };
    } else {
        return { value: days, label: 'days left' };
    }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AssignmentShow({ assignment }: AssignmentShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        ...(assignment.course
            ? [{ title: assignment.course.name, href: `/studium/courses/${assignment.course.id}` }]
            : []),
        { title: assignment.title, href: `/studium/assignments/${assignment.id}` },
    ];

    const overdue = !assignment.grade && isOverdue(assignment.deadline);
    const completed = assignment.grade !== null;
    const daysInfo = getDaysUntil(assignment.deadline);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${assignment.title} - Studium`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href={assignment.course ? `/studium/courses/${assignment.course.id}` : '/studium/programs'}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            completed
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : overdue
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                    >
                        {completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                            <FileText className={`h-6 w-6 ${overdue ? 'text-red-600' : 'text-blue-600'}`} />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{assignment.title}</h1>
                            {assignment.type && (
                                <span
                                    className="rounded-full px-3 py-1 text-sm text-white"
                                    style={{ backgroundColor: assignment.type.color }}
                                >
                                    {assignment.type.name}
                                </span>
                            )}
                        </div>
                        {assignment.course && (
                            <p className="mt-1 text-muted-foreground">
                                {assignment.course.code} - {assignment.course.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/studium/assignments/${assignment.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Card */}
                <div
                    className={`rounded-xl border-2 p-6 ${
                        completed
                            ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10'
                            : overdue
                              ? 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10'
                              : 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className={`text-xl font-bold ${completed ? 'text-green-600' : overdue ? 'text-red-600' : ''}`}>
                                {completed ? 'Completed' : overdue ? 'Overdue' : 'Pending'}
                            </p>
                        </div>

                        {completed ? (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Grade</p>
                                <p className="text-3xl font-bold text-green-600">{assignment.grade}</p>
                            </div>
                        ) : daysInfo ? (
                            <div className="text-right">
                                <p className={`text-3xl font-bold ${overdue ? 'text-red-600' : ''}`}>
                                    {daysInfo.value === 0 ? daysInfo.label : daysInfo.value}
                                </p>
                                {daysInfo.value !== 0 && (
                                    <p className={`text-sm ${overdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {daysInfo.label}
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Deadline */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Deadline
                        </div>
                        <p className={`mt-2 font-medium ${overdue ? 'text-red-500' : ''}`}>
                            {formatDeadline(assignment.deadline)}
                        </p>
                    </div>

                    {/* Type */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Type
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            {assignment.type ? (
                                <>
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: assignment.type.color }}
                                    />
                                    <span className="font-medium">{assignment.type.name}</span>
                                </>
                            ) : (
                                <span className="font-medium">-</span>
                            )}
                        </div>
                    </div>

                    {/* Created */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Created
                        </div>
                        <p className="mt-2 font-medium">{formatDate(assignment.created_at)}</p>
                    </div>

                    {/* Calendar */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Calendar Event
                        </div>
                        <div className="mt-2">
                            {assignment.gcal_event_id ? (
                                <Button variant="link" className="h-auto p-0">
                                    <ExternalLink className="mr-1 h-4 w-4" />
                                    View in Google Calendar
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Add to Calendar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button 
                        className="flex-1"
                        variant={completed ? 'outline' : 'default'}
                        onClick={() => router.patch(`/studium/assignments/${assignment.id}/toggle-complete`)}
                    >
                        {completed ? (
                            <>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Mark as Pending
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Complete
                            </>
                        )}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/studium/assignments/${assignment.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Assignment
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
