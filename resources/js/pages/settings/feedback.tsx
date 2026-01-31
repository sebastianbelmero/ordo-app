import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Bug, Lightbulb, MessageCircle, MoreHorizontal } from 'lucide-react';
import FeedbackController from '@/actions/App/Http/Controllers/Settings/FeedbackController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { feedback } from '@/routes/settings';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Feedback',
        href: feedback().url,
    },
];

type FeedbackType = 'bug_report' | 'feature_request' | 'general' | 'other';
type FeedbackStatus = 'pending' | 'read' | 'resolved' | 'closed';

type FeedbackItem = {
    id: number;
    type: FeedbackType;
    subject: string;
    message: string;
    status: FeedbackStatus;
    created_at: string;
};

type Props = {
    feedbacks: FeedbackItem[];
    status?: string;
};

const feedbackTypes = [
    { value: 'bug_report', label: 'Laporan Bug', icon: Bug },
    { value: 'feature_request', label: 'Permintaan Fitur', icon: Lightbulb },
    { value: 'general', label: 'Feedback Umum', icon: MessageCircle },
    { value: 'other', label: 'Lainnya', icon: MoreHorizontal },
] as const;

const statusLabels: Record<FeedbackStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; description: string }> = {
    pending: { label: 'Menunggu', variant: 'secondary', description: 'Feedback belum dibaca oleh tim' },
    read: { label: 'Sedang Ditinjau', variant: 'default', description: 'Feedback sedang ditinjau oleh tim' },
    resolved: { label: 'Selesai', variant: 'outline', description: 'Feedback telah ditindaklanjuti' },
    closed: { label: 'Ditutup', variant: 'destructive', description: 'Feedback telah ditutup' },
};

export default function Feedback({ feedbacks, status }: Props) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        type: '',
        subject: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(FeedbackController.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback" />

            <h1 className="sr-only">Feedback</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Kirim Feedback"
                        description="Bantu kami meningkatkan aplikasi dengan mengirim laporan bug, permintaan fitur, atau saran lainnya"
                    />

                    {status && (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipe Feedback</Label>

                            <Select
                                name="type"
                                value={data.type}
                                onValueChange={(value) => setData('type', value)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Pilih tipe feedback" />
                                </SelectTrigger>
                                <SelectContent>
                                    {feedbackTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className="h-4 w-4" />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subjek</Label>

                            <Input
                                id="subject"
                                name="subject"
                                className="mt-1 block w-full"
                                placeholder="Ringkasan singkat feedback Anda"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={errors.subject} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message">Pesan</Label>

                            <Textarea
                                id="message"
                                name="message"
                                className="mt-1 block w-full min-h-[150px]"
                                placeholder="Jelaskan detail feedback Anda. Untuk laporan bug, sertakan langkah-langkah untuk mereproduksi masalah."
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                required
                            />

                            <InputError className="mt-2" message={errors.message} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} data-test="send-feedback-button">
                                Kirim Feedback
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Terkirim!</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {feedbacks.length > 0 && (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Riwayat Feedback"
                            description="Daftar feedback yang pernah Anda kirim"
                        />

                        <div className="space-y-4">
                            {feedbacks.map((item) => {
                                const typeInfo = feedbackTypes.find((t) => t.value === item.type);
                                const statusInfo = statusLabels[item.status];
                                const TypeIcon = typeInfo?.icon || MessageCircle;

                                return (
                                    <Card key={item.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                    <CardTitle className="text-sm font-medium">
                                                        {item.subject}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant={statusInfo.variant}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {statusInfo.description}
                                                    </span>
                                                </div>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {typeInfo?.label} • {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {item.message}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
