import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, GripVertical, Check, X } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface Status {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
    is_completed?: boolean;
    level?: number;
}

interface OpusSettingsProps {
    projectStatuses: Status[];
    taskStatuses: Status[];
    taskPriorities: Status[];
}

// =============================================================================
// COLOR OPTIONS
// =============================================================================

const colorOptions = [
    '#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

// =============================================================================
// BREADCRUMBS
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Opus Settings', href: '/settings/opus' },
];

// =============================================================================
// STATUS ITEM COMPONENT
// =============================================================================

function StatusItem({
    item,
    type,
    onEdit,
    onDelete,
}: {
    item: Status;
    type: 'project-statuses' | 'task-statuses' | 'task-priorities';
    onEdit: (item: Status) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
            </div>
            <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                {item.is_system && (
                    <span className="ml-2 text-xs text-muted-foreground">(System)</span>
                )}
                {item.is_completed && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                    </span>
                )}
            </div>
            {!item.is_system && (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. Items using this status will have their status set to null.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// CREATE/EDIT DIALOG
// =============================================================================

function StatusDialog({
    type,
    title,
    item,
    open,
    onOpenChange,
    showCompleted = false,
    showLevel = false,
}: {
    type: 'project-statuses' | 'task-statuses' | 'task-priorities';
    title: string;
    item?: Status | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    showCompleted?: boolean;
    showLevel?: boolean;
}) {
    const isEdit = !!item;
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        color: '#64748b',
        order: 0,
        is_completed: false,
        level: 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name || '',
                slug: item?.slug || '',
                color: item?.color || '#64748b',
                order: item?.order || 0,
                is_completed: item?.is_completed || false,
                level: item?.level || 0,
            });
        }
    }, [open, item]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/settings/opus/${type}/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(`/settings/opus/${type}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit' : 'Add'} {title}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the status details below.' : 'Create a new status for your workflow.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => {
                                setData('name', e.target.value);
                                if (!isEdit) {
                                    setData('slug', generateSlug(e.target.value));
                                }
                            }}
                            placeholder="Status name"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="status_slug"
                            />
                            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                                        data.color === color ? 'border-foreground scale-110' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setData('color', color)}
                                />
                            ))}
                        </div>
                    </div>

                    {showCompleted && (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label>Mark as Completed</Label>
                                <p className="text-sm text-muted-foreground">
                                    Tasks with this status are considered done
                                </p>
                            </div>
                            <Switch
                                checked={data.is_completed}
                                onCheckedChange={(checked) => setData('is_completed', checked)}
                            />
                        </div>
                    )}

                    {showLevel && (
                        <div className="space-y-2">
                            <Label>Priority Level (0-10)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={10}
                                value={data.level}
                                onChange={(e) => setData('level', parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Higher level = higher priority
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Save Changes' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function OpusSettings({ projectStatuses, taskStatuses, taskPriorities }: OpusSettingsProps) {
    const [editingItem, setEditingItem] = useState<Status | null>(null);
    const [dialogType, setDialogType] = useState<'project-statuses' | 'task-statuses' | 'task-priorities' | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = (type: 'project-statuses' | 'task-statuses' | 'task-priorities', item: Status) => {
        setDialogType(type);
        setEditingItem(item);
        setIsCreating(false);
    };

    const handleCreate = (type: 'project-statuses' | 'task-statuses' | 'task-priorities') => {
        setDialogType(type);
        setEditingItem(null);
        setIsCreating(true);
    };

    const handleDelete = (type: 'project-statuses' | 'task-statuses' | 'task-priorities', id: number) => {
        router.delete(`/settings/opus/${type}/${id}`, {
            preserveScroll: true,
        });
    };

    const handleDialogClose = () => {
        setDialogType(null);
        setEditingItem(null);
        setIsCreating(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Opus Settings" />

            <h1 className="sr-only">Opus Settings</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    <Heading
                        variant="small"
                        title="Opus Settings"
                        description="Kelola status dan prioritas untuk proyek dan tugas Anda"
                    />

                    {/* Project Statuses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Project Statuses</h3>
                                <p className="text-sm text-muted-foreground">
                                    Status untuk proyek (Active, On Hold, Archived, dll)
                                </p>
                            </div>
                            <Button size="sm" onClick={() => handleCreate('project-statuses')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Status
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {projectStatuses.map((item) => (
                                <StatusItem
                                    key={item.id}
                                    item={item}
                                    type="project-statuses"
                                    onEdit={(item) => handleEdit('project-statuses', item)}
                                    onDelete={(id) => handleDelete('project-statuses', id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Task Statuses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Task Statuses</h3>
                                <p className="text-sm text-muted-foreground">
                                    Status untuk tugas di Kanban board (To Do, In Progress, Done, dll)
                                </p>
                            </div>
                            <Button size="sm" onClick={() => handleCreate('task-statuses')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Status
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {taskStatuses.map((item) => (
                                <StatusItem
                                    key={item.id}
                                    item={item}
                                    type="task-statuses"
                                    onEdit={(item) => handleEdit('task-statuses', item)}
                                    onDelete={(id) => handleDelete('task-statuses', id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Task Priorities */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Task Priorities</h3>
                                <p className="text-sm text-muted-foreground">
                                    Prioritas tugas (Low, Medium, High, Urgent, dll)
                                </p>
                            </div>
                            <Button size="sm" onClick={() => handleCreate('task-priorities')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Priority
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {taskPriorities.map((item) => (
                                <StatusItem
                                    key={item.id}
                                    item={item}
                                    type="task-priorities"
                                    onEdit={(item) => handleEdit('task-priorities', item)}
                                    onDelete={(id) => handleDelete('task-priorities', id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsLayout>

            {/* Dialogs */}
            <StatusDialog
                type="project-statuses"
                title="Project Status"
                item={dialogType === 'project-statuses' ? editingItem : null}
                open={dialogType === 'project-statuses'}
                onOpenChange={(open) => !open && handleDialogClose()}
            />
            <StatusDialog
                type="task-statuses"
                title="Task Status"
                item={dialogType === 'task-statuses' ? editingItem : null}
                open={dialogType === 'task-statuses'}
                onOpenChange={(open) => !open && handleDialogClose()}
                showCompleted
            />
            <StatusDialog
                type="task-priorities"
                title="Task Priority"
                item={dialogType === 'task-priorities' ? editingItem : null}
                open={dialogType === 'task-priorities'}
                onOpenChange={(open) => !open && handleDialogClose()}
                showLevel
            />
        </AppLayout>
    );
}
