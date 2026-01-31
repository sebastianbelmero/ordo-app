import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Bug, Calendar, Lightbulb, MessageCircle, MoreHorizontal, User } from 'lucide-react';
import FeedbackAdminController from '@/actions/App/Http/Controllers/Admin/FeedbackController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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

interface FeedbackShowProps {
    feedback: FeedbackItem;
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
        weekday: 'long',
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FeedbackShow({ feedback }: FeedbackShowProps) {
    const typeInfo = feedbackTypes.find((t) => t.value === feedback.type);
    const statusInfo = statusLabels[feedback.status];
    const TypeIcon = typeInfo?.icon || MessageCircle;

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        status: feedback.status,
        admin_notes: feedback.admin_notes || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/feedbacks' },
        { title: 'Feedbacks', href: '/admin/feedbacks' },
        { title: `#${feedback.id}`, href: `/admin/feedbacks/${feedback.id}` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(FeedbackAdminController.updateStatus({ feedback: feedback.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Feedback #${feedback.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/feedbacks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Feedback #{feedback.id}</h1>
                            <span className={`rounded-full px-3 py-1 text-sm ${typeInfo?.color}`}>
                                {typeInfo?.label}
                            </span>
                            <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">{feedback.subject}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Feedback Message */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <TypeIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{feedback.subject}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(feedback.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{feedback.message}</p>
                            </div>
                        </div>

                        {/* Update Status Form */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Update Status</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as FeedbackStatus)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Menunggu</SelectItem>
                                            <SelectItem value="read">Dibaca</SelectItem>
                                            <SelectItem value="resolved">Selesai</SelectItem>
                                            <SelectItem value="closed">Ditutup</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="admin_notes">Catatan Admin</Label>
                                    <Textarea
                                        id="admin_notes"
                                        placeholder="Tambahkan catatan internal (tidak terlihat oleh user)"
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        Simpan Perubahan
                                    </Button>
                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600">Tersimpan!</p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <InfoCard
                            icon={User}
                            label="Pengirim"
                            value={
                                <div className="flex items-center gap-3">
                                    {feedback.user.avatar ? (
                                        <img
                                            src={feedback.user.avatar}
                                            alt={feedback.user.name}
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{feedback.user.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {feedback.user.email}
                                        </p>
                                    </div>
                                </div>
                            }
                        />

                        <InfoCard
                            icon={TypeIcon}
                            label="Tipe Feedback"
                            value={
                                <span className={`rounded-full px-3 py-1 text-sm ${typeInfo?.color}`}>
                                    {typeInfo?.label}
                                </span>
                            }
                        />

                        <InfoCard
                            icon={Calendar}
                            label="Dikirim pada"
                            value={
                                <p className="text-sm">{formatDateTime(feedback.created_at)}</p>
                            }
                        />

                        <InfoCard
                            icon={Calendar}
                            label="Terakhir diperbarui"
                            value={
                                <p className="text-sm">{formatDateTime(feedback.updated_at)}</p>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
