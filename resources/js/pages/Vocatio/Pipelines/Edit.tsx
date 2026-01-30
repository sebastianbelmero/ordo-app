import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    description: string | null;
    color: string;
}

interface EditPipelineProps {
    pipeline: Pipeline;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditPipeline({ pipeline }: EditPipelineProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio' },
        { title: 'Pipelines', href: '/vocatio/pipelines' },
        { title: pipeline.name, href: `/vocatio/pipelines/${pipeline.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: pipeline.name,
        description: pipeline.description || '',
        color: pipeline.color,
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/vocatio/pipelines/${pipeline.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/vocatio/pipelines/${pipeline.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const colorOptions = [
        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pipeline - ${pipeline.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/vocatio/pipelines/${pipeline.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Pipeline</h1>
                            <p className="text-muted-foreground">Update pipeline details</p>
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
                                <AlertDialogTitle>Delete Pipeline?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{pipeline.name}" and all its
                                    jobs. This action cannot be undone.
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
                            {/* Pipeline Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Pipeline Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Software Engineer Jobs, Q1 2025 Applications"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
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
                                    placeholder="Add details about this pipeline..."
                                    rows={3}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            {/* Preview */}
                            <div className="mt-6 border-t pt-6">
                                <Label className="text-muted-foreground">Preview</Label>
                                <div className="mt-2 flex items-center gap-3 rounded-lg border p-4">
                                    <div
                                        className="h-10 w-10 rounded-lg"
                                        style={{ backgroundColor: data.color }}
                                    />
                                    <div>
                                        <p className="font-medium">
                                            {data.name || 'Pipeline Name'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {data.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/vocatio/pipelines/${pipeline.id}`)}
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
