import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Share2,
    Building2,
    MapPin,
    DollarSign,
    Star,
    ExternalLink,
    UserCircle,
    CheckCircle,
    XCircle,
    Hourglass,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface User {
    id: number;
    name: string;
    email: string;
}

interface JobStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
}

interface Job {
    id: string;
    company: string;
    position: string;
    url: string | null;
    location: string | null;
    level_of_interest: number;
    salary_min: number | null;
    salary_max: number | null;
    status?: JobStatus;
}

interface JobShare {
    id: string;
    message: string | null;
    status: 'pending' | 'accepted' | 'declined';
    job_id: string;
    sender_id: number;
    receiver_id: number;
    created_at: string;
    updated_at: string;
    job?: Job;
    sender?: User;
    receiver?: User;
}

interface ShareShowProps {
    share: JobShare;
    currentUserId: number;
}

// =============================================================================
// HELPER
// =============================================================================

function formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return '-';
    const format = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toLocaleString();
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return `Up to ${format(max!)}`;
}

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'accepted':
            return {
                icon: CheckCircle,
                label: 'Accepted',
                color: 'text-emerald-500',
                bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            };
        case 'declined':
            return {
                icon: XCircle,
                label: 'Declined',
                color: 'text-red-500',
                bg: 'bg-red-100 dark:bg-red-900/30',
            };
        default:
            return {
                icon: Hourglass,
                label: 'Pending',
                color: 'text-amber-500',
                bg: 'bg-amber-100 dark:bg-amber-900/30',
            };
    }
}

// =============================================================================
// COMPONENTS
// =============================================================================

function InterestStars({ level }: { level: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

function UserCard({ user, label }: { user?: User; label: string }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <UserCircle className="h-8 w-8 text-slate-500" />
                </div>
                <div>
                    <p className="font-medium">{user?.name ?? 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? '-'}</p>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ShareShow({ share, currentUserId }: ShareShowProps) {
    const [isResponding, setIsResponding] = useState(false);
    
    const statusConfig = getStatusConfig(share.status);
    const StatusIcon = statusConfig.icon;
    const isReceiver = share.receiver_id === currentUserId;
    const canRespond = share.status === 'pending' && isReceiver;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: 'Shares', href: '/vocatio/shares' },
        { title: share.job ? `${share.job.position} @ ${share.job.company}` : 'Share Detail', href: `/vocatio/shares/${share.id}` },
    ];

    const handleRespond = (status: 'accepted' | 'rejected') => {
        setIsResponding(true);
        router.patch(
            `/vocatio/shares/${share.id}/respond`,
            { status },
            {
                onFinish: () => setIsResponding(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Detail - Vocatio" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/vocatio/shares">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <Share2 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Job Share</h1>
                        <p className="text-muted-foreground">
                            {share.sender?.name ?? 'Someone'} shared a job with {share.receiver?.name ?? 'someone'}
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusConfig.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                    </div>
                </div>

                {/* Users */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <UserCard user={share.sender} label="Shared by" />
                    <UserCard user={share.receiver} label="Shared with" />
                </div>

                {/* Message */}
                {share.message && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            Message
                        </div>
                        <p className="whitespace-pre-wrap">{share.message}</p>
                    </div>
                )}

                {/* Job Details */}
                {share.job && (
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Shared Job</h2>

                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600 dark:bg-slate-800">
                                {share.job.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold">{share.job.position}</h3>
                                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                    {share.job.company}
                                </div>
                            </div>
                            {share.job.status && (
                                <span
                                    className="rounded-full px-3 py-1 text-sm text-white"
                                    style={{ backgroundColor: share.job.status.color }}
                                >
                                    {share.job.status.name}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">Interest Level</p>
                                <div className="mt-1">
                                    <InterestStars level={share.job.level_of_interest} />
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    Location
                                </div>
                                <p className="mt-1 font-medium">{share.job.location ?? '-'}</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <DollarSign className="h-3 w-3" />
                                    Salary
                                </div>
                                <p className="mt-1 font-medium">
                                    {formatSalary(share.job.salary_min, share.job.salary_max)}
                                </p>
                            </div>
                            {share.job.url && (
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">Job Posting</p>
                                    <a
                                        href={share.job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        View
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <Link href={`/vocatio/jobs/${share.job.id}`}>
                                <Button variant="outline" className="w-full">
                                    View Full Job Details
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Shared at
                        </div>
                        <p className="mt-2">{formatDateTime(share.created_at)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Last Updated
                        </div>
                        <p className="mt-2">{formatDateTime(share.updated_at)}</p>
                    </div>
                </div>

                {/* Actions - only show for pending shares if user is receiver */}
                {canRespond && (
                    <div className="flex gap-3">
                        <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            disabled={isResponding}
                            onClick={() => handleRespond('accepted')}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {isResponding ? 'Processing...' : 'Accept'}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-1 text-red-600 hover:text-red-700"
                            disabled={isResponding}
                            onClick={() => handleRespond('rejected')}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {isResponding ? 'Processing...' : 'Decline'}
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
