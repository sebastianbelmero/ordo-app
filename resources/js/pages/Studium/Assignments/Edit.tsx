import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
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

interface Course {
    id: number;
    code: string;
    name: string;
}

interface AssignmentType {
    id: number;
    name: string;
    color: string;
}

interface Assignment {
    id: number;
    course_id: number;
    type_id: number | null;
    title: string;
    deadline: string | null;
    grade: number | null;
    gcal_event_id: string | null;
    course?: Course;
}

interface EditAssignmentProps {
    assignment: Assignment;
    types: { data: AssignmentType[] };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditAssignment({ assignment, types }: EditAssignmentProps) {
    const assignmentTypes = types?.data || [];
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: assignment.course?.name || 'Course', href: assignment.course ? `/studium/courses/${assignment.course.id}` : '/studium' },
        { title: assignment.title, href: `/studium/assignments/${assignment.id}` },
        { title: 'Edit', href: '#' },
    ];

    // Format datetime for input
    const formatDateTimeLocal = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const { data, setData, put, processing, errors } = useForm({
        type_id: assignment.type_id?.toString() || '',
        title: assignment.title,
        deadline: formatDateTimeLocal(assignment.deadline || ''),
        grade: assignment.grade?.toString() || '',
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/studium/assignments/${assignment.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/studium/assignments/${assignment.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Assignment - ${assignment.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/studium/assignments/${assignment.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Assignment</h1>
                            <p className="text-muted-foreground">Update assignment details</p>
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
                                <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{assignment.title}". This action
                                    cannot be undone.
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
                            {/* Course (read-only) & Type */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Course</Label>
                                    <Input
                                        value={assignment.course ? `${assignment.course.code} - ${assignment.course.name}` : 'Unknown Course'}
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

                            {/* Grade */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="grade">Grade (0-100)</Label>
                                <Input
                                    id="grade"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.grade}
                                    onChange={(e) => setData('grade', e.target.value)}
                                    placeholder="Leave empty if not graded yet"
                                    className={errors.grade ? 'border-destructive' : ''}
                                />
                                {errors.grade && (
                                    <p className="text-sm text-destructive">{errors.grade}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/studium/assignments/${assignment.id}`)}
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
