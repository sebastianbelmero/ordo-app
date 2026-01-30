import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Layers, Save, Trash2 } from 'lucide-react';
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

interface ProjectStatus {
    id: number;
    name: string;
    color: string;
    slug: string;
}

interface Project {
    id: number;
    workspace_id: number;
    name: string;
    status_id: number;
    status?: ProjectStatus;
}

interface StatusConfig {
    project_statuses: ProjectStatus[];
    task_statuses: Array<{ id: number; name: string; color: string }>;
    task_priorities: Array<{ id: number; name: string; color: string }>;
}

interface EditProjectProps {
    project: Project;
    statusConfig: StatusConfig;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EditProject({ project, statusConfig }: EditProjectProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: 'Projects', href: '/opus/workspaces' },
        { title: project.name, href: `/opus/projects/${project.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: project.name,
        status_id: project.status_id.toString(),
    });

    const [isDeleting, setIsDeleting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/opus/projects/${project.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/opus/projects/${project.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit(`/opus/projects/${project.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Project</h1>
                            <p className="text-muted-foreground">Update project settings</p>
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
                                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{project.name}" and all its tasks.
                                    This action cannot be undone.
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
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Website Redesign, Mobile App"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status_id}
                                    onValueChange={(value) => setData('status_id', value)}
                                >
                                    <SelectTrigger
                                        className={errors.status_id ? 'border-destructive' : ''}
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusConfig.project_statuses.map((status) => (
                                            <SelectItem
                                                key={status.id}
                                                value={status.id.toString()}
                                            >
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

                            {/* Preview */}
                            <div className="mt-6">
                                <Label>Preview</Label>
                                <div className="mt-2 flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Layers className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {data.name || 'Project Name'}
                                        </p>
                                        {data.status_id && (
                                            <span
                                                className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs text-white"
                                                style={{
                                                    backgroundColor:
                                                        statusConfig.project_statuses.find(
                                                            (s) =>
                                                                s.id.toString() === data.status_id
                                                        )?.color || '#888',
                                                }}
                                            >
                                                {
                                                    statusConfig.project_statuses.find(
                                                        (s) => s.id.toString() === data.status_id
                                                    )?.name
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/opus/projects/${project.id}`)}
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
