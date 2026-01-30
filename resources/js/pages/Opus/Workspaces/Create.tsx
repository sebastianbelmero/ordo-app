import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, FolderKanban, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface CreateWorkspaceProps {
    statusConfig: {
        project_statuses: Array<{ id: number; name: string; color: string }>;
        task_statuses: Array<{ id: number; name: string; color: string }>;
        task_priorities: Array<{ id: number; name: string; color: string }>;
    };
}

// =============================================================================
// BREADCRUMBS
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Opus', href: '/opus/workspaces' },
    { title: 'Workspaces', href: '/opus/workspaces' },
    { title: 'Create', href: '#' },
];

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

export default function CreateWorkspace({ statusConfig }: CreateWorkspaceProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        color: '#3b82f6',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/opus/workspaces');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Workspace - Opus" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/opus/workspaces')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Workspace</h1>
                        <p className="text-muted-foreground">
                            Add a new workspace to organize your projects
                        </p>
                    </div>
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
                                    autoFocus
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
                                            0 projects
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
                                onClick={() => router.visit('/opus/workspaces')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
