import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface Semester {
    id: number;
    name: string;
    program?: { id: number; name: string };
}

interface CreateCourseProps {
    semester: Semester;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateCourse({ semester }: CreateCourseProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: semester.program?.name || 'Program', href: semester.program ? `/studium/programs/${semester.program.id}` : '/studium' },
        { title: semester.name, href: `/studium/semesters/${semester.id}` },
        { title: 'Create Course', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        credits: '',
        instructor: '',
        schedule: '',
        location: '',
        description: '',
        color: '#3b82f6',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/studium/semesters/${semester.id}/courses`);
    };

    const colorOptions = [
        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit(`/studium/semesters/${semester.id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Course</h1>
                        <p className="text-muted-foreground">Add a new course to {semester.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Semester (read-only) */}
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    value={`${semester.name}${semester.program ? ` (${semester.program.name})` : ''}`}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            {/* Code & Name */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Course Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., CS101"
                                        className={errors.code ? 'border-destructive' : ''}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Introduction to Programming"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Credits & Instructor */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="credits">Credits</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        min="0"
                                        value={data.credits}
                                        onChange={(e) => setData('credits', e.target.value)}
                                        placeholder="e.g., 3"
                                        className={errors.credits ? 'border-destructive' : ''}
                                    />
                                    {errors.credits && (
                                        <p className="text-sm text-destructive">{errors.credits}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instructor">Instructor</Label>
                                    <Input
                                        id="instructor"
                                        type="text"
                                        value={data.instructor}
                                        onChange={(e) => setData('instructor', e.target.value)}
                                        placeholder="e.g., Dr. John Smith"
                                        className={errors.instructor ? 'border-destructive' : ''}
                                    />
                                    {errors.instructor && (
                                        <p className="text-sm text-destructive">{errors.instructor}</p>
                                    )}
                                </div>
                            </div>

                            {/* Schedule & Location */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="schedule">Schedule</Label>
                                    <Input
                                        id="schedule"
                                        type="text"
                                        value={data.schedule}
                                        onChange={(e) => setData('schedule', e.target.value)}
                                        placeholder="e.g., MWF 10:00-11:00"
                                        className={errors.schedule ? 'border-destructive' : ''}
                                    />
                                    {errors.schedule && (
                                        <p className="text-sm text-destructive">{errors.schedule}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., Room 101"
                                        className={errors.location ? 'border-destructive' : ''}
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-destructive">{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* Color */}
                            <div className="mt-6 space-y-2">
                                <Label>Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-8 w-8 rounded-full border-2 transition-transform ${
                                                data.color === color
                                                    ? 'scale-110 border-foreground'
                                                    : 'border-transparent hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setData('color', color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Add course description..."
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/studium/semesters/${semester.id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Course
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
