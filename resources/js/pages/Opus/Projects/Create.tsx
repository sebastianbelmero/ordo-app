import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Layers, Save } from 'lucide-react';
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

interface Workspace {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface ProjectStatus {
    id: number;
    name: string;
    color: string;
    slug: string;
}

interface StatusConfig {
    project_statuses: ProjectStatus[];
    task_statuses: Array<{ id: number; name: string; color: string }>;
    task_priorities: Array<{ id: number; name: string; color: string }>;
}

interface CreateProjectProps {
    workspace: Workspace;
    statusConfig: StatusConfig;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateProject({ workspace, statusConfig }: CreateProjectProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: 'Workspaces', href: '/opus/workspaces' },
        { title: workspace.name, href: `/opus/workspaces/${workspace.id}` },
        { title: 'New Project', href: '#' },
    ];

    const defaultStatus = statusConfig.project_statuses.find((s) => s.slug === 'active');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        status_id: defaultStatus?.id?.toString() || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/opus/workspaces/${workspace.id}/projects`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`New Project - ${workspace.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit(`/opus/workspaces/${workspace.id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">New Project</h1>
                        <p className="text-muted-foreground">
                            Add a project to {workspace.name}
                        </p>
                    </div>
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
                                    autoFocus
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
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${workspace.color}20` }}
                                    >
                                        <Layers
                                            className="h-5 w-5"
                                            style={{ color: workspace.color }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {data.name || 'Project Name'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            in {workspace.name}
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
                                Create Project
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
