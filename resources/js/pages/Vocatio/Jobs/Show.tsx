import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Building2,
    MapPin,
    DollarSign,
    Star,
    ExternalLink,
    Calendar,
    Clock,
    Share2,
    Edit,
    Trash2,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface JobStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_final: boolean;
}

interface Pipeline {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Job {
    id: string;
    company: string;
    position: string;
    url: string | null;
    location: string | null;
    notes: string | null;
    due_date: string | null;
    level_of_interest: number;
    salary_min: number | null;
    salary_max: number | null;
    user_id: number;
    status_id: number;
    pipeline_id: number;
    created_at: string;
    updated_at: string;
    status?: JobStatus;
    pipeline?: Pipeline;
}

interface JobShowProps {
    job: Job;
    statuses: {
        data: JobStatus[];
    };
    friends: User[];
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

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
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

// =============================================================================
// COMPONENTS
// =============================================================================

function InterestStars({ level }: { level: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

function StatusTimeline({ statuses, currentStatusId }: { statuses: JobStatus[]; currentStatusId: number }) {
    const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
    const currentIndex = sortedStatuses.findIndex((s) => s.id === currentStatusId);

    return (
        <div className="flex items-center gap-2">
            {sortedStatuses.map((status, index) => {
                const isPast = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={status.id} className="flex items-center">
                        <div
                            className={`flex h-8 items-center rounded-full px-3 text-xs font-medium transition-all ${
                                isCurrent
                                    ? 'text-white'
                                    : isPast
                                      ? 'bg-muted text-muted-foreground'
                                      : 'border border-muted-foreground/30 text-muted-foreground/50'
                            }`}
                            style={isCurrent ? { backgroundColor: status.color } : undefined}
                        >
                            {status.name}
                        </div>
                        {index < sortedStatuses.length - 1 && (
                            <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/30" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function JobShow({ job, statuses, friends }: JobShowProps) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [shareMessage, setShareMessage] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: 'Jobs', href: '/vocatio/jobs' },
        { title: `${job.position} @ ${job.company}`, href: `/vocatio/jobs/${job.id}` },
    ];

    const handleUpdateStatus = (statusId: number) => {
        setIsUpdating(true);
        router.patch(
            `/vocatio/jobs/${job.id}/status`,
            { status_id: statusId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsStatusDialogOpen(false);
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            }
        );
    };

    const handleShareJob = () => {
        if (!selectedUserId) return;
        
        setIsSharing(true);
        router.post(
            '/vocatio/shares',
            {
                job_id: job.id,
                receiver_id: selectedUserId,
                message: shareMessage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsShareDialogOpen(false);
                    setSelectedUserId(null);
                    setShareMessage('');
                },
                onFinish: () => {
                    setIsSharing(false);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${job.position} @ ${job.company} - Vocatio`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/vocatio/jobs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600 dark:bg-slate-800">
                        {job.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{job.position}</h1>
                        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{job.company}</span>
                            {job.pipeline && (
                                <>
                                    <span>•</span>
                                    <Link
                                        href={`/vocatio/pipelines/${job.pipeline.id}`}
                                        className="hover:underline"
                                    >
                                        {job.pipeline.name}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/vocatio/jobs/${job.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="rounded-xl border bg-card p-4">
                    <p className="mb-3 text-sm text-muted-foreground">Application Progress</p>
                    <StatusTimeline statuses={statuses.data} currentStatusId={job.status_id} />
                </div>

                {/* Main Info */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Interest Level */}
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Interest Level</p>
                        <div className="mt-2">
                            <InterestStars level={job.level_of_interest} />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Location
                        </div>
                        <p className="mt-2 font-medium">{job.location ?? '-'}</p>
                    </div>

                    {/* Salary */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Salary Range
                        </div>
                        <p className="mt-2 font-medium">{formatSalary(job.salary_min, job.salary_max)}</p>
                    </div>

                    {/* Due Date */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Due Date
                        </div>
                        <p className="mt-2 font-medium">{formatDate(job.due_date)}</p>
                    </div>
                </div>

                {/* Job URL */}
                {job.url && (
                    <div className="rounded-lg border bg-card p-4">
                        <p className="mb-2 text-sm text-muted-foreground">Job Posting</p>
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {job.url}
                        </a>
                    </div>
                )}

                {/* Notes */}
                {job.notes && (
                    <div className="rounded-lg border bg-card p-4">
                        <p className="mb-2 text-sm text-muted-foreground">Notes</p>
                        <p className="whitespace-pre-wrap">{job.notes}</p>
                    </div>
                )}

                {/* Timestamps */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Added
                        </div>
                        <p className="mt-2">{formatDateTime(job.created_at)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Last Updated
                        </div>
                        <p className="mt-2">{formatDateTime(job.updated_at)}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-1">Update Status</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Application Status</DialogTitle>
                                <DialogDescription>
                                    Select a new status for this job application.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                                {[...statuses.data]
                                    .sort((a, b) => a.order - b.order)
                                    .map((status) => (
                                        <Button
                                            key={status.id}
                                            variant={status.id === job.status_id ? 'default' : 'outline'}
                                            className="justify-start"
                                            disabled={isUpdating || status.id === job.status_id}
                                            onClick={() => handleUpdateStatus(status.id)}
                                        >
                                            <span
                                                className="mr-2 h-3 w-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            {status.name}
                                            {status.id === job.status_id && (
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    Current
                                                </span>
                                            )}
                                        </Button>
                                    ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    {/* Share Job Dialog */}
                    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Job</DialogTitle>
                                <DialogDescription>
                                    Share this job opportunity with another user.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Friend</label>
                                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                        {friends.length === 0 ? (
                                            <p className="py-4 text-center text-sm text-muted-foreground">
                                                No friends yet. Add friends to share jobs!
                                            </p>
                                        ) : (
                                            friends.map((friend) => (
                                                <button
                                                    key={friend.id}
                                                    type="button"
                                                    className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                                                        selectedUserId === friend.id
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                    onClick={() => setSelectedUserId(friend.id)}
                                                >
                                                    <div className="font-medium">{friend.name}</div>
                                                    <div className={`text-xs ${
                                                        selectedUserId === friend.id 
                                                            ? 'text-primary-foreground/70' 
                                                            : 'text-muted-foreground'
                                                    }`}>
                                                        {friend.email}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message (optional)</label>
                                    <textarea
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        rows={3}
                                        placeholder="Add a message..."
                                        value={shareMessage}
                                        onChange={(e) => setShareMessage(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    className="w-full" 
                                    disabled={!selectedUserId || isSharing}
                                    onClick={handleShareJob}
                                >
                                    {isSharing ? 'Sharing...' : 'Share Job'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
