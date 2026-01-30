import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, CheckSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Project {
    id: number;
    workspace_id: number;
    name: string;
}

interface TaskStatus {
    id: number;
    name: string;
    color: string;
    slug: string;
    is_completed: boolean;
}

interface TaskPriority {
    id: number;
    name: string;
    color: string;
    slug: string;
    level: number;
}

interface StatusConfig {
    project_statuses: Array<{ id: number; name: string; color: string }>;
    task_statuses: TaskStatus[];
    task_priorities: TaskPriority[];
}

interface CreateTaskProps {
    project: Project;
    statusConfig: StatusConfig;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreateTask({ project, statusConfig }: CreateTaskProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Opus', href: '/opus/workspaces' },
        { title: project.name, href: `/opus/projects/${project.id}` },
        { title: 'New Task', href: '#' },
    ];

    const defaultStatus = statusConfig.task_statuses.find((s) => s.slug === 'todo');
    const defaultPriority = statusConfig.task_priorities.find((p) => p.slug === 'medium');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status_id: defaultStatus?.id?.toString() || '',
        priority_id: defaultPriority?.id?.toString() || '',
        due_date: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/opus/projects/${project.id}/tasks`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`New Task - ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit(`/opus/projects/${project.id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">New Task</h1>
                        <p className="text-muted-foreground">Add a task to {project.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Implement user authentication"
                                    className={errors.title ? 'border-destructive' : ''}
                                    autoFocus
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Add more details about this task..."
                                    rows={4}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            {/* Status & Priority */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={data.status_id}
                                        onValueChange={(value) => setData('status_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusConfig.task_statuses.map((status) => (
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
                                </div>

                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={data.priority_id}
                                        onValueChange={(value) => setData('priority_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusConfig.task_priorities.map((priority) => (
                                                <SelectItem
                                                    key={priority.id}
                                                    value={priority.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor: priority.color,
                                                            }}
                                                        />
                                                        {priority.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="mt-6 space-y-2">
                                <Label htmlFor="due_date">Due Date (Optional)</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className={errors.due_date ? 'border-destructive' : ''}
                                />
                                {errors.due_date && (
                                    <p className="text-sm text-destructive">{errors.due_date}</p>
                                )}
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
                                Create Task
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
