import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormEventHandler } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface Job {
    id: string;
    company: string;
    position: string;
}

interface CreateShareProps {
    jobs: Job[];
    jobId?: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateShare({ jobs, jobId }: CreateShareProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio' },
        { title: 'Shares', href: '/vocatio/shares' },
        { title: 'Create', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        job_id: jobId?.toString() || '',
        shared_with_email: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/vocatio/shares');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Job" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/vocatio/shares')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Share Job</h1>
                        <p className="text-muted-foreground">Share a job opportunity with someone</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Job */}
                            <div className="space-y-2">
                                <Label>Job to Share</Label>
                                <Select
                                    value={data.job_id}
                                    onValueChange={(value) => setData('job_id', value)}
                                >
                                    <SelectTrigger className={errors.job_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a job" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobs.map((job) => (
                                            <SelectItem key={job.id} value={job.id.toString()}>
                                                {job.company} - {job.position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.job_id && (
                                    <p className="text-sm text-destructive">{errors.job_id}</p>
                                )}
                            </div>

                            {/* Recipient Email */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="shared_with_email">Recipient Email</Label>
                                <Input
                                    id="shared_with_email"
                                    type="email"
                                    value={data.shared_with_email}
                                    onChange={(e) => setData('shared_with_email', e.target.value)}
                                    placeholder="friend@example.com"
                                    className={errors.shared_with_email ? 'border-destructive' : ''}
                                />
                                {errors.shared_with_email && (
                                    <p className="text-sm text-destructive">{errors.shared_with_email}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    The person you want to share this job with
                                </p>
                            </div>

                            {/* Message */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Add a personal message..."
                                    rows={3}
                                    className={errors.message ? 'border-destructive' : ''}
                                />
                                {errors.message && (
                                    <p className="text-sm text-destructive">{errors.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/vocatio/shares')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Job
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
