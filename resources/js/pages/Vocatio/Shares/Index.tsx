import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Share2,
    Send,
    Inbox,
    Clock,
    Building2,
    ChevronRight,
    CheckCircle,
    XCircle,
    Hourglass,
    UserCircle,
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

interface Job {
    id: string;
    company: string;
    position: string;
}

interface JobShare {
    id: string;
    message: string | null;
    status: 'pending' | 'accepted' | 'declined';
    job_id: string;
    sender_id: number;
    receiver_id: number;
    created_at: string;
    job?: Job;
    sender?: User;
    receiver?: User;
}

interface SharesIndexProps {
    sent: {
        data: JobShare[];
    };
    received: {
        data: JobShare[];
    };
    pending: {
        data: JobShare[];
    };
}

// =============================================================================
// HELPER
// =============================================================================

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'accepted':
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'declined':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Hourglass className="h-4 w-4 text-amber-500" />;
    }
}

function getStatusBadge(status: string) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
        pending: 'Pending',
        accepted: 'Accepted',
        declined: 'Declined',
    };
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
}

// =============================================================================
// COMPONENTS
// =============================================================================

type TabType = 'pending' | 'received' | 'sent';

function ShareRow({ share, type }: { share: JobShare; type: 'sent' | 'received' }) {
    const user = type === 'sent' ? share.receiver : share.sender;

    return (
        <Link href={`/vocatio/shares/${share.id}`}>
            <div className="group flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm dark:border-sidebar-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <UserCircle className="h-6 w-6 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{user?.name ?? 'Unknown User'}</span>
                        {getStatusBadge(share.status)}
                    </div>
                    {share.job && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{share.job.position}</span>
                            <span>@</span>
                            <span>{share.job.company}</span>
                        </div>
                    )}
                    {share.message && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{share.message}</p>
                    )}
                </div>

                <span className="hidden text-sm text-muted-foreground sm:block">{formatDate(share.created_at)}</span>

                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function EmptyState({ type }: { type: TabType }) {
    const messages = {
        pending: {
            title: 'No pending shares',
            description: "You don't have any pending share requests.",
        },
        received: {
            title: 'No received shares',
            description: "No one has shared jobs with you yet.",
        },
        sent: {
            title: 'No sent shares',
            description: "You haven't shared any jobs yet.",
        },
    };

    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Share2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">{messages[type].title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{messages[type].description}</p>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SharesIndex({ sent, received, pending }: SharesIndexProps) {
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio/pipelines' },
        { title: 'Shares', href: '/vocatio/shares' },
    ];

    const tabs: { id: TabType; label: string; icon: typeof Send; count: number }[] = [
        { id: 'pending', label: 'Pending', icon: Clock, count: pending.data.length },
        { id: 'received', label: 'Received', icon: Inbox, count: received.data.length },
        { id: 'sent', label: 'Sent', icon: Send, count: sent.data.length },
    ];

    const getShares = () => {
        switch (activeTab) {
            case 'sent':
                return sent.data;
            case 'received':
                return received.data;
            default:
                return pending.data;
        }
    };

    const shares = getShares();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Shares - Vocatio" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <Share2 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Job Shares</h1>
                        <p className="text-muted-foreground">
                            Share job opportunities with others
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b pb-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                            onClick={() => setActiveTab(tab.id)}
                            className="gap-2"
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        activeTab === tab.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                {shares.length > 0 ? (
                    <div className="space-y-3">
                        {shares.map((share) => (
                            <ShareRow
                                key={share.id}
                                share={share}
                                type={activeTab === 'sent' ? 'sent' : 'received'}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState type={activeTab} />
                )}
            </div>
        </AppLayout>
    );
}
