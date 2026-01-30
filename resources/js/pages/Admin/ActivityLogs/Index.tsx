import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { ActivityLog, BreadcrumbItem, PaginatedData } from '@/types';
import {
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Search,
    User,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface UserOption {
    id: number;
    name: string;
    email: string;
}

interface ActivityLogsIndexProps {
    activities: PaginatedData<ActivityLog>;
    logNames: string[];
    users: UserOption[];
    filters: {
        log_name?: string;
        causer_id?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
        per_page?: string;
    };
}

// =============================================================================
// HELPER
// =============================================================================

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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

function ActivityRow({ activity }: { activity: ActivityLog }) {
    return (
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                {activity.causer?.avatar ? (
                    <img
                        src={activity.causer.avatar}
                        alt={activity.causer.name}
                        className="h-10 w-10 rounded-full"
                    />
                ) : (
                    <User className="h-5 w-5 text-primary" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium">
                        {activity.causer?.name ?? 'System'}
                    </span>
                    {activity.log_name && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${getLogColor(activity.log_name)}`}
                        >
                            {activity.log_name}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(activity.created_at)}
                </p>
            </div>

            <Link href={`/admin/activity-logs/${activity.id}`}>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

function Pagination({ data }: { data: PaginatedData<ActivityLog> }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {data.from ?? 0} to {data.to ?? 0} of {data.total} results
            </p>
            <div className="flex items-center gap-2">
                {data.links.map((link, index) => {
                    if (link.label.includes('Previous')) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="icon"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        );
                    }
                    if (link.label.includes('Next')) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="icon"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        );
                    }
                    return (
                        <Button
                            key={index}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                        >
                            {link.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ActivityLogsIndex({
    activities,
    logNames,
    users,
    filters,
}: ActivityLogsIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [logName, setLogName] = useState(filters.log_name ?? '');
    const [causerId, setCauserId] = useState(filters.causer_id ?? '');
    const [fromDate, setFromDate] = useState(filters.from_date ?? '');
    const [toDate, setToDate] = useState(filters.to_date ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? '20');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/activity-logs' },
        { title: 'Activity Logs', href: '/admin/activity-logs' },
    ];

    const applyFilters = () => {
        router.get('/admin/activity-logs', {
            search: search || undefined,
            log_name: logName || undefined,
            causer_id: causerId || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            per_page: perPage !== '20' ? perPage : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setLogName('');
        setCauserId('');
        setFromDate('');
        setToDate('');
        setPerPage('20');
        router.get('/admin/activity-logs');
    };

    const hasFilters = search || logName || causerId || fromDate || toDate || perPage !== '20';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
                        <p className="text-sm text-muted-foreground">
                            View all activity logs across the application
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {activities.total} total logs
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter className="h-4 w-4" />
                        Filters
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="pl-9"
                            />
                        </div>

                        <Select value={logName || 'all'} onValueChange={(v) => setLogName(v === 'all' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Log type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {logNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={causerId || 'all'} onValueChange={(v) => setCauserId(v === 'all' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            placeholder="From date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />

                        <Input
                            type="date"
                            placeholder="To date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />

                        <Select value={perPage} onValueChange={setPerPage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        {hasFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Activity List */}
                {activities.data.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <Activity className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No activity logs found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {hasFilters
                                ? 'Try adjusting your filters'
                                : 'Activity logs will appear here as users interact with the app'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {activities.data.map((activity) => (
                                <ActivityRow key={activity.id} activity={activity} />
                            ))}
                        </div>

                        <Pagination data={activities} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
