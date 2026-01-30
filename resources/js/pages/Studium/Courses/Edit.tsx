import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Semester {
    id: number;
    name: string;
    program?: { name: string };
}

interface Course {
    id: number;
    semester_id: number;
    code: string;
    name: string;
    credits: number;
    lecturer_name: string | null;
    lecturer_contact: string | null;
    semester?: Semester;
}

interface EditCourseProps {
    course: Course;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditCourse({ course }: EditCourseProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Studium', href: '/studium' },
        { title: 'Courses', href: '/studium/courses' },
        { title: course.name, href: `/studium/courses/${course.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        code: course.code || '',
        name: course.name,
        credits: course.credits?.toString() || '',
        lecturer_name: course.lecturer_name || '',
        lecturer_contact: course.lecturer_contact || '',
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/studium/courses/${course.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/studium/courses/${course.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Course - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/studium/courses/${course.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Course</h1>
                            <p className="text-muted-foreground">Update course details</p>
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
                                <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{course.code} - {course.name}" and
                                    all its assignments. This action cannot be undone.
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
                            {/* Semester (Read-only) */}
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    type="text"
                                    value={course.semester?.name || 'Unknown Semester'}
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

                            {/* Credits */}
                            <div className="mt-6 space-y-2">
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

                            {/* Lecturer Info */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lecturer_name">Lecturer Name</Label>
                                    <Input
                                        id="lecturer_name"
                                        type="text"
                                        value={data.lecturer_name}
                                        onChange={(e) => setData('lecturer_name', e.target.value)}
                                        placeholder="e.g., Dr. John Smith"
                                        className={errors.lecturer_name ? 'border-destructive' : ''}
                                    />
                                    {errors.lecturer_name && (
                                        <p className="text-sm text-destructive">{errors.lecturer_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lecturer_contact">Lecturer Contact</Label>
                                    <Input
                                        id="lecturer_contact"
                                        type="text"
                                        value={data.lecturer_contact}
                                        onChange={(e) => setData('lecturer_contact', e.target.value)}
                                        placeholder="e.g., john@university.edu"
                                        className={errors.lecturer_contact ? 'border-destructive' : ''}
                                    />
                                    {errors.lecturer_contact && (
                                        <p className="text-sm text-destructive">{errors.lecturer_contact}</p>
                                    )}
                                </div>
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
