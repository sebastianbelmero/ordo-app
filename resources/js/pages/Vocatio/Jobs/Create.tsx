import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
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

interface CreateJobProps {
    pipeline: Pipeline;
    statuses: { data: JobStatus[] } | JobStatus[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateJob({ pipeline, statuses }: CreateJobProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio' },
        { title: 'Jobs', href: '/vocatio/jobs' },
        { title: 'Create', href: '#' },
    ];

    // Handle statuses format
    const statusList = Array.isArray(statuses) ? statuses : (statuses?.data || []);
    const defaultStatusId = statusList.find((s) => s.slug === 'wishlist')?.id || statusList[0]?.id;

    const { data, setData, post, processing, errors } = useForm({
        status_id: defaultStatusId?.toString() || '',
        company: '',
        position: '',
        location: '',
        salary_min: '',
        salary_max: '',
        level_of_interest: '3',
        job_url: '',
        description: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/vocatio/pipelines/${pipeline.id}/jobs`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Job" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/vocatio/jobs')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Job</h1>
                        <p className="text-muted-foreground">Add a new job application to track</p>
                    </div>
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
                                        value={pipeline.name}
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

                            {/* Job URL */}}
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
                                onClick={() => router.visit('/vocatio/jobs')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Job
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
