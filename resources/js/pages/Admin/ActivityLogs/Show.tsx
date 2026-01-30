import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { ActivityLog, BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Code,
    FileText,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface ActivityLogShowProps {
    activity: ActivityLog;
}

// =============================================================================
// HELPER
// =============================================================================

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function getLogColor(logName: string | null): string {
    const colors: Record<string, string> = {
        default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        auth: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        user: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        system: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[logName ?? 'default'] ?? colors.default;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function InfoCard({
    icon: Icon,
    label,
    value,
    className,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-lg border bg-card p-4 ${className ?? ''}`}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            <div className="mt-2">{value}</div>
        </div>
    );
}

function JsonViewer({ data }: { data: Record<string, unknown> | null }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <p className="text-sm italic text-muted-foreground">No properties</p>
        );
    }

    return (
        <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-sm">
            <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ActivityLogShow({ activity }: ActivityLogShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/activity-logs' },
        { title: 'Activity Logs', href: '/admin/activity-logs' },
        { title: `Log #${activity.id}`, href: `/admin/activity-logs/${activity.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Activity Log #${activity.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/activity-logs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Activity Log #{activity.id}</h1>
                            {activity.log_name && (
                                <span
                                    className={`rounded-full px-3 py-1 text-sm ${getLogColor(activity.log_name)}`}
                                >
                                    {activity.log_name}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-muted-foreground">{activity.description}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 font-semibold">
                                <FileText className="h-5 w-5" />
                                Description
                            </div>
                            <p className="mt-4 text-lg">{activity.description}</p>
                        </div>

                        {/* Properties */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 font-semibold">
                                <Code className="h-5 w-5" />
                                Properties
                            </div>
                            <div className="mt-4">
                                <JsonViewer data={activity.properties} />
                            </div>
                        </div>

                        {/* Subject Info */}
                        {activity.subject && (
                            <div className="rounded-lg border bg-card p-6">
                                <div className="flex items-center gap-2 font-semibold">
                                    <FileText className="h-5 w-5" />
                                    Subject
                                </div>
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Type:</span>{' '}
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                                            {activity.subject_type}
                                        </code>
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">ID:</span>{' '}
                                        {activity.subject_id}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Causer */}
                        <InfoCard
                            icon={User}
                            label="Performed by"
                            value={
                                activity.causer ? (
                                    <div className="flex items-center gap-3">
                                        {activity.causer.avatar ? (
                                            <img
                                                src={activity.causer.avatar}
                                                alt={activity.causer.name}
                                                className="h-10 w-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{activity.causer.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.causer.email}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">System</span>
                                )
                            }
                        />

                        {/* Timestamp */}
                        <InfoCard
                            icon={Calendar}
                            label="Created at"
                            value={
                                <span className="font-medium">
                                    {formatDateTime(activity.created_at)}
                                </span>
                            }
                        />

                        {/* Log Name */}
                        {activity.log_name && (
                            <InfoCard
                                icon={FileText}
                                label="Log name"
                                value={
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-sm ${getLogColor(activity.log_name)}`}
                                    >
                                        {activity.log_name}
                                    </span>
                                }
                            />
                        )}

                        {/* IDs */}
                        <InfoCard
                            icon={Clock}
                            label="References"
                            value={
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-muted-foreground">Activity ID:</span>{' '}
                                        {activity.id}
                                    </p>
                                    {activity.causer_id && (
                                        <p>
                                            <span className="text-muted-foreground">Causer ID:</span>{' '}
                                            {activity.causer_id}
                                        </p>
                                    )}
                                    {activity.subject_id && (
                                        <p>
                                            <span className="text-muted-foreground">Subject ID:</span>{' '}
                                            {activity.subject_id}
                                        </p>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
