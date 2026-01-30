import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, FolderKanban, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState } from 'react';
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

// =============================================================================
// TYPES
// =============================================================================

interface Workspace {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    color: string;
}

interface EditWorkspaceProps {
    workspace: Workspace;
    statusConfig: {
        project_statuses: Array<{ id: number; name: string; color: string }>;
        task_statuses: Array<{ id: number; name: string; color: string }>;
        task_priorities: Array<{ id: number; name: string; color: string }>;
    };
}

// =============================================================================
// COLOR OPTIONS
// =============================================================================

const colorOptions = [
    { name: 'Slate', value: '#64748b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditWorkspace({ workspace, statusConfig }: EditWorkspaceProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: 'Workspaces', href: '/opus/workspaces' },
        { title: workspace.name, href: `/opus/workspaces/${workspace.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: workspace.name,
        color: workspace.color,
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/opus/workspaces/${workspace.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/opus/workspaces/${workspace.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${workspace.name} - Opus`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/opus/workspaces/${workspace.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Workspace</h1>
                            <p className="text-muted-foreground">
                                Update workspace settings
                            </p>
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
                                <AlertDialogTitle>Delete Workspace?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{workspace.name}" and all its
                                    projects and tasks. This action cannot be undone.
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
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Workspace Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Work Projects, Personal, Freelance"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Color */}
                            <div className="mt-6 space-y-2">
                                <Label>Workspace Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setData('color', color.value)}
                                            className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                                                data.color === color.value
                                                    ? 'ring-2 ring-offset-2 ring-offset-background'
                                                    : ''
                                            }`}
                                            style={{
                                                backgroundColor: color.value,
                                                '--tw-ring-color': color.value,
                                            } as React.CSSProperties}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                {errors.color && (
                                    <p className="text-sm text-destructive">{errors.color}</p>
                                )}
                            </div>

                            {/* Preview */}
                            <div className="mt-6">
                                <Label>Preview</Label>
                                <div className="mt-2 flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${data.color}20` }}
                                    >
                                        <FolderKanban
                                            className="h-5 w-5"
                                            style={{ color: data.color }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {data.name || 'Workspace Name'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            /{workspace.slug}
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
                                onClick={() => router.visit(`/opus/workspaces/${workspace.id}`)}
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
