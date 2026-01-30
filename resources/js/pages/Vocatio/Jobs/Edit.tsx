import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Save, Trash2, Star } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FormEventHandler, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface Pipeline {
    id: number;
    name: string;
}

interface JobStatus {
    id: number;
    name: string;
    color: string;
    slug: string;
}

interface Job {
    id: number;
    pipeline_id: number;
    status_id: number;
    company: string;
    position: string;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    level_of_interest: number;
    job_url: string | null;
    description: string | null;
    notes: string | null;
    pipeline?: Pipeline;
}

interface EditJobProps {
    job: Job;
    statuses: { data: JobStatus[] } | JobStatus[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditJob({ job, statuses }: EditJobProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio' },
        { title: 'Jobs', href: '/vocatio/jobs' },
        { title: `${job.company} - ${job.position}`, href: `/vocatio/jobs/${job.id}` },
        { title: 'Edit', href: '#' },
    ];

    // Handle statuses format
    const statusList = Array.isArray(statuses) ? statuses : (statuses?.data || []);

    const { data, setData, put, processing, errors } = useForm({
        status_id: job.status_id.toString(),
        company: job.company,
        position: job.position,
        location: job.location || '',
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        level_of_interest: job.level_of_interest?.toString() || '3',
        job_url: job.job_url || '',
        description: job.description || '',
        notes: job.notes || '',
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/vocatio/jobs/${job.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/vocatio/jobs/${job.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Job - ${job.company}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/vocatio/jobs/${job.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Job</h1>
                            <p className="text-muted-foreground">Update job application details</p>
                        </div>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the job application for "{job.position}"
                                    at "{job.company}". This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Pipeline & Status */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Pipeline</Label>
                                    <Input
                                        type="text"
                                        value={job.pipeline?.name || 'Unknown Pipeline'}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={data.status_id}
                                        onValueChange={(value) => setData('status_id', value)}
                                    >
                                        <SelectTrigger className={errors.status_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusList.map((status) => (
                                                <SelectItem key={status.id} value={status.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: status.color }}
                                                        />
                                                        {status.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status_id && (
                                        <p className="text-sm text-destructive">{errors.status_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Company & Position */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        type="text"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        placeholder="e.g., Google, Meta, Stripe"
                                        className={errors.company ? 'border-destructive' : ''}
                                    />
                                    {errors.company && (
                                        <p className="text-sm text-destructive">{errors.company}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="e.g., Software Engineer, Product Manager"
                                        className={errors.position ? 'border-destructive' : ''}
                                    />
                                    {errors.position && (
                                        <p className="text-sm text-destructive">{errors.position}</p>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="location">Location (Optional)</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="e.g., Remote, San Francisco, CA"
                                    className={errors.location ? 'border-destructive' : ''}
                                />
                                {errors.location && (
                                    <p className="text-sm text-destructive">{errors.location}</p>
                                )}
                            </div>

                            {/* Salary Range */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="salary_min">Min Salary (Optional)</Label>
                                    <Input
                                        id="salary_min"
                                        type="number"
                                        min="0"
                                        value={data.salary_min}
                                        onChange={(e) => setData('salary_min', e.target.value)}
                                        placeholder="e.g., 100000"
                                        className={errors.salary_min ? 'border-destructive' : ''}
                                    />
                                    {errors.salary_min && (
                                        <p className="text-sm text-destructive">{errors.salary_min}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salary_max">Max Salary (Optional)</Label>
                                    <Input
                                        id="salary_max"
                                        type="number"
                                        min="0"
                                        value={data.salary_max}
                                        onChange={(e) => setData('salary_max', e.target.value)}
                                        placeholder="e.g., 150000"
                                        className={errors.salary_max ? 'border-destructive' : ''}
                                    />
                                    {errors.salary_max && (
                                        <p className="text-sm text-destructive">{errors.salary_max}</p>
                                    )}
                                </div>
                            </div>

                            {/* Interest Level */}
                            <div className="mt-6 space-y-2">
                                <Label>Interest Level</Label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setData('level_of_interest', level.toString())}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`h-6 w-6 ${
                                                    level <= parseInt(data.level_of_interest || '0')
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-muted-foreground/30'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {data.level_of_interest ? `${data.level_of_interest}/5` : 'Select'}
                                    </span>
                                </div>
                                {errors.level_of_interest && (
                                    <p className="text-sm text-destructive">{errors.level_of_interest}</p>
                                )}
                            </div>

                            {/* Job URL */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="job_url">Job URL (Optional)</Label>
                                <Input
                                    id="job_url"
                                    type="url"
                                    value={data.job_url}
                                    onChange={(e) => setData('job_url', e.target.value)}
                                    placeholder="https://..."
                                    className={errors.job_url ? 'border-destructive' : ''}
                                />
                                {errors.job_url && (
                                    <p className="text-sm text-destructive">{errors.job_url}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="description">Job Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Paste the job description here..."
                                    rows={4}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Your personal notes about this job..."
                                    rows={3}
                                    className={errors.notes ? 'border-destructive' : ''}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/vocatio/jobs/${job.id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
