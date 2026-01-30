import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Course {
    id: number;
    code: string;
    name: string;
    semester?: {
        id: number;
        name: string;
    };
}

interface AssignmentType {
    id: number;
    name: string;
    color: string;
}

interface CreateAssignmentProps {
    course: Course;
    types: { data: AssignmentType[] };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateAssignment({ course, types }: CreateAssignmentProps) {
    const assignmentTypes = types?.data || [];
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: course.name, href: `/studium/courses/${course.id}` },
        { title: 'Create Assignment', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        type_id: '',
        title: '',
        deadline: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/studium/courses/${course.id}/assignments`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Assignment" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit(`/studium/courses/${course.id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Assignment</h1>
                        <p className="text-muted-foreground">Add a new assignment to {course.code} - {course.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Course (read-only) & Type */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <Input
                                        value={`${course.code} - ${course.name}`}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Assignment Type</Label>
                                    <Select
                                        value={data.type_id}
                                        onValueChange={(value) => setData('type_id', value)}
                                    >
                                        <SelectTrigger className={errors.type_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignmentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                        {type.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type_id && (
                                        <p className="text-sm text-destructive">{errors.type_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Midterm Exam, Assignment 1"
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            {/* Deadline */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="deadline">Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    className={errors.deadline ? 'border-destructive' : ''}
                                />
                                {errors.deadline && (
                                    <p className="text-sm text-destructive">{errors.deadline}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/studium/courses/${course.id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Assignment
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
