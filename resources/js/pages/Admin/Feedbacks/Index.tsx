import { Head, Link, router } from '@inertiajs/react';
import { Bug, ChevronLeft, ChevronRight, Eye, Filter, Lightbulb, MessageCircle, MessageSquare, MoreHorizontal, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

type FeedbackType = 'bug_report' | 'feature_request' | 'general' | 'other';
type FeedbackStatus = 'pending' | 'read' | 'resolved' | 'closed';

interface FeedbackItem {
    id: number;
    user_id: number;
    type: FeedbackType;
    subject: string;
    message: string;
    status: FeedbackStatus;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface UserOption {
    id: number;
    name: string;
    email: string;
}

interface FeedbacksIndexProps {
    feedbacks: PaginatedData<FeedbackItem>;
    users: UserOption[];
    filters: {
        type?: string;
        status?: string;
        user_id?: string;
        search?: string;
        per_page?: string;
    };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const feedbackTypes = [
    { value: 'bug_report', label: 'Laporan Bug', icon: Bug, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'feature_request', label: 'Permintaan Fitur', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'general', label: 'Feedback Umum', icon: MessageCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'other', label: 'Lainnya', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
] as const;

const statusLabels: Record<FeedbackStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    pending: { label: 'Menunggu', variant: 'secondary' },
    read: { label: 'Dibaca', variant: 'default' },
    resolved: { label: 'Selesai', variant: 'outline' },
    closed: { label: 'Ditutup', variant: 'destructive' },
};

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

// =============================================================================
// COMPONENTS
// =============================================================================

function FeedbackRow({ feedback }: { feedback: FeedbackItem }) {
    const typeInfo = feedbackTypes.find((t) => t.value === feedback.type);
    const statusInfo = statusLabels[feedback.status];
    const TypeIcon = typeInfo?.icon || MessageCircle;

    return (
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                {feedback.user?.avatar ? (
                    <img
                        src={feedback.user.avatar}
                        alt={feedback.user.name}
                        className="h-10 w-10 rounded-full"
                    />
                ) : (
                    <TypeIcon className="h-5 w-5 text-primary" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{feedback.subject}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${typeInfo?.color}`}>
                        {typeInfo?.label}
                    </span>
                    <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{feedback.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Dari: {feedback.user?.name} • {formatDateTime(feedback.created_at)}
                </p>
            </div>

            <Link href={`/admin/feedbacks/${feedback.id}`}>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

function Pagination({ data }: { data: PaginatedData<FeedbackItem> }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                Menampilkan {data.from ?? 0} - {data.to ?? 0} dari {data.total} hasil
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

export default function FeedbacksIndex({ feedbacks, users, filters }: FeedbacksIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [userId, setUserId] = useState(filters.user_id ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? '20');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/feedbacks' },
        { title: 'Feedbacks', href: '/admin/feedbacks' },
    ];

    const applyFilters = () => {
        router.get('/admin/feedbacks', {
            search: search || undefined,
            type: type || undefined,
            status: status || undefined,
            user_id: userId || undefined,
            per_page: perPage !== '20' ? perPage : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setType('');
        setStatus('');
        setUserId('');
        setPerPage('20');
        router.get('/admin/feedbacks');
    };

    const hasFilters = search || type || status || userId || perPage !== '20';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Feedbacks" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Feedbacks</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua feedback dari pengguna
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {feedbacks.total} total feedback
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter className="h-4 w-4" />
                        Filter
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari feedback..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="pl-9"
                            />
                        </div>

                        <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua tipe</SelectItem>
                                {feedbackTypes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua status</SelectItem>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="read">Dibaca</SelectItem>
                                <SelectItem value="resolved">Selesai</SelectItem>
                                <SelectItem value="closed">Ditutup</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={userId || 'all'} onValueChange={(v) => setUserId(v === 'all' ? '' : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua user</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={perPage} onValueChange={setPerPage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Per halaman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per halaman</SelectItem>
                                <SelectItem value="20">20 per halaman</SelectItem>
                                <SelectItem value="50">50 per halaman</SelectItem>
                                <SelectItem value="100">100 per halaman</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Button onClick={applyFilters}>Terapkan Filter</Button>
                        {hasFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>

                {/* Feedback List */}
                {feedbacks.data.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-16">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Tidak ada feedback</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {hasFilters
                                ? 'Coba sesuaikan filter Anda'
                                : 'Feedback dari pengguna akan muncul di sini'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {feedbacks.data.map((feedback) => (
                                <FeedbackRow key={feedback.id} feedback={feedback} />
                            ))}
                        </div>

                        <Pagination data={feedbacks} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
