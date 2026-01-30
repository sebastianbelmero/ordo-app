import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FormEventHandler } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface CreateProgramProps {
    // No props needed for create
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateProgram({}: CreateProgramProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: 'Programs', href: '/studium/programs' },
        { title: 'Create', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        institution: '',
        start_date: '',
        end_date: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/studium/programs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Program" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/studium/programs')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Program</h1>
                        <p className="text-muted-foreground">Add a new academic program</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Program Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Program Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Bachelor of Computer Science"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Institution */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <Input
                                    id="institution"
                                    type="text"
                                    value={data.institution}
                                    onChange={(e) => setData('institution', e.target.value)}
                                    placeholder="e.g., University of Technology"
                                    className={errors.institution ? 'border-destructive' : ''}
                                />
                                {errors.institution && (
                                    <p className="text-sm text-destructive">{errors.institution}</p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date (Expected)</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={errors.end_date ? 'border-destructive' : ''}
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/studium/programs')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Program
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
