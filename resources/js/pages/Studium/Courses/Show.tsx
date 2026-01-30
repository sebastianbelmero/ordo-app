import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    Clock,
    MapPin,
    User,
    Mail,
    FileText,
    CheckCircle2,
    Calendar,
    MoreHorizontal,
    Edit,
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

interface Schedule {
    day: string;
    start: string;
    end: string;
    room: string;
}

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
    gcal_event_id: string | null;
    created_at: string;
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
    lecturer_contact: string | null;
    created_at: string;
    assignments?: Assignment[];
    semester?: {
        id: number;
        name: string;
        program?: {
            id: number;
            name: string;
        };
    };
}

interface CourseShowProps {
    course: Course;
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

function getDaysUntil(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// =============================================================================
// COMPONENTS
// =============================================================================

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const overdue = !assignment.grade && isOverdue(assignment.deadline);
    const completed = assignment.grade !== null;
    const daysUntil = getDaysUntil(assignment.deadline);

    return (
        <Link href={`/studium/assignments/${assignment.id}`}>
            <div className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        {completed ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                        ) : (
                            <div
                                className={`mt-0.5 h-5 w-5 rounded-full border-2 ${
                                    overdue ? 'border-red-500' : 'border-muted-foreground'
                                }`}
                            />
                        )}
                        <div>
                            <h4 className={`font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                                {assignment.title}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                {assignment.type && (
                                    <span
                                        className="rounded-full px-2 py-0.5 text-xs text-white"
                                        style={{ backgroundColor: assignment.type.color }}
                                    >
                                        {assignment.type.name}
                                    </span>
                                )}
                                {assignment.deadline && (
                                    <span
                                        className={`flex items-center gap-1 text-xs ${
                                            overdue
                                                ? 'text-red-500'
                                                : daysUntil !== null && daysUntil <= 3
                                                  ? 'text-amber-500'
                                                  : 'text-muted-foreground'
                                        }`}
                                    >
                                        <Calendar className="h-3 w-3" />
                                        {formatDeadline(assignment.deadline)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {completed && (
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {assignment.grade}
                            </span>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/studium/assignments/${assignment.id}`}>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/studium/assignments/${assignment.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                            <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
        </Link>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CourseShow({ course }: CourseShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium/programs' },
        ...(course.semester
            ? [{ title: course.semester.name, href: `/studium/semesters/${course.semester.id}` }]
            : []),
        { title: course.name, href: `/studium/courses/${course.id}` },
    ];

    const schedule = parseSchedule(course.schedule_data);
    const assignments = course.assignments ?? [];
    const completedCount = assignments.filter((a) => a.grade !== null).length;
    const upcomingCount = assignments.filter((a) => !a.grade && !isOverdue(a.deadline)).length;
    const overdueCount = assignments.filter((a) => !a.grade && isOverdue(a.deadline)).length;

    // Group assignments
    const overdueAssignments = assignments.filter((a) => !a.grade && isOverdue(a.deadline));
    const pendingAssignments = assignments.filter((a) => !a.grade && !isOverdue(a.deadline));
    const completedAssignments = assignments.filter((a) => a.grade !== null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${course.name} - Studium`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={course.semester ? `/studium/semesters/${course.semester.id}` : '/studium/programs'}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-muted px-2 py-0.5 text-sm font-mono">{course.code}</span>
                            <h1 className="text-2xl font-bold">{course.name}</h1>
                        </div>
                        <p className="text-muted-foreground">{course.credits} SKS</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/studium/courses/${course.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/studium/courses/${course.id}/assignments/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Assignment
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Course Info */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Schedule */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Schedule
                        </div>
                        <p className="mt-1 font-medium">
                            {schedule ? `${schedule.day}, ${schedule.start} - ${schedule.end}` : 'TBA'}
                        </p>
                    </div>

                    {/* Room */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Room
                        </div>
                        <p className="mt-1 font-medium">{schedule?.room ?? 'TBA'}</p>
                    </div>

                    {/* Lecturer */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            Lecturer
                        </div>
                        <p className="mt-1 font-medium">{course.lecturer_name ?? 'TBA'}</p>
                    </div>

                    {/* Contact */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            Contact
                        </div>
                        <p className="mt-1 font-medium truncate">{course.lecturer_contact ?? '-'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Total Assignments
                        </div>
                        <p className="mt-1 text-2xl font-bold">{assignments.length}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Upcoming
                        </div>
                        <p className="mt-1 text-2xl font-bold">{upcomingCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-red-500" />
                            Overdue
                        </div>
                        <p className="mt-1 text-2xl font-bold text-red-500">{overdueCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Completed
                        </div>
                        <p className="mt-1 text-2xl font-bold text-green-600">{completedCount}</p>
                    </div>
                </div>

                {/* Assignments */}
                <div className="space-y-6">
                    {/* Overdue */}
                    {overdueAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold text-red-500">
                                <Clock className="h-4 w-4" />
                                Overdue ({overdueAssignments.length})
                            </h2>
                            <div className="space-y-2">
                                {overdueAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending */}
                    {pendingAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold">
                                <Clock className="h-4 w-4 text-amber-500" />
                                Upcoming ({pendingAssignments.length})
                            </h2>
                            <div className="space-y-2">
                                {pendingAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {completedAssignments.length > 0 && (
                        <div>
                            <h2 className="mb-3 flex items-center gap-2 font-semibold text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed ({completedAssignments.length})
                            </h2>
                            <div className="space-y-2">
                                {completedAssignments.map((assignment) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty */}
                    {assignments.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-medium">No assignments yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Add assignments for this course.
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href={`/studium/courses/${course.id}/assignments/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Assignment
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
