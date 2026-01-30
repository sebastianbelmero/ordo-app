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

interface Program {
    id: number;
    name: string;
}

interface CreateSemesterProps {
    program: Program;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateSemester({ program }: CreateSemesterProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: program.name, href: `/studium/programs/${program.id}` },
        { title: 'Create Semester', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/studium/programs/${program.id}/semesters`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Semester" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit(`/studium/programs/${program.id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Semester</h1>
                        <p className="text-muted-foreground">Add a new semester to {program.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Program (read-only) */}
                            <div className="space-y-2">
                                <Label>Program</Label>
                                <Input
                                    value={program.name}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            {/* Semester Name */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="name">Semester Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Fall 2024, Semester 1"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
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
                                    <Label htmlFor="end_date">End Date</Label>
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
                                onClick={() => router.visit(`/studium/programs/${program.id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Semester
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
