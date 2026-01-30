import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, GripVertical, Flag } from 'lucide-react';
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

interface JobStatus {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
    is_final: boolean;
}

interface VocatioSettingsProps {
    jobStatuses: JobStatus[];
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
    { title: 'Vocatio Settings', href: '/settings/vocatio' },
];

// =============================================================================
// STATUS ITEM COMPONENT
// =============================================================================

function StatusItem({
    item,
    onEdit,
    onDelete,
}: {
    item: JobStatus;
    onEdit: (item: JobStatus) => void;
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
                {item.is_final && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Flag className="mr-1 inline h-3 w-3" />
                        Final
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
                                    This action cannot be undone. Jobs using this status will have their status set to null.
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
    item,
    open,
    onOpenChange,
}: {
    item?: JobStatus | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = !!item;
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        color: '#64748b',
        order: 0,
        is_final: false,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name || '',
                slug: item?.slug || '',
                color: item?.color || '#64748b',
                order: item?.order || 0,
                is_final: item?.is_final || false,
            });
        }
    }, [open, item]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/settings/vocatio/job-statuses/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(`/settings/vocatio/job-statuses`, {
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
                    <DialogTitle>{isEdit ? 'Edit' : 'Add'} Job Status</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the job status details below.' : 'Create a new job status for your applications.'}
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

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label>Final Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Jobs with this status are considered closed (e.g., Offer, Rejected)
                            </p>
                        </div>
                        <Switch
                            checked={data.is_final}
                            onCheckedChange={(checked) => setData('is_final', checked)}
                        />
                    </div>

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

export default function VocatioSettings({ jobStatuses }: VocatioSettingsProps) {
    const [editingItem, setEditingItem] = useState<JobStatus | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEdit = (item: JobStatus) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        router.delete(`/settings/vocatio/job-statuses/${id}`, {
            preserveScroll: true,
        });
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setIsDialogOpen(false);
            setEditingItem(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vocatio Settings" />

            <h1 className="sr-only">Vocatio Settings</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    <Heading
                        variant="small"
                        title="Vocatio Settings"
                        description="Kelola status untuk lamaran kerja Anda"
                    />

                    {/* Job Statuses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Job Statuses</h3>
                                <p className="text-sm text-muted-foreground">
                                    Status lamaran kerja (Saved, Applied, Interview, Offer, Rejected, dll)
                                </p>
                            </div>
                            <Button size="sm" onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Status
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {jobStatuses.map((item) => (
                                <StatusItem
                                    key={item.id}
                                    item={item}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsLayout>

            {/* Dialog */}
            <StatusDialog
                item={editingItem}
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
            />
        </AppLayout>
    );
}
