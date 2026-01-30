import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AssignmentType {
    id: number;
    slug: string;
    name: string;
    color: string;
    order: number;
    is_system: boolean;
}

interface StudiumSettingsProps {
    assignmentTypes: AssignmentType[];
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
    { title: 'Studium Settings', href: '/settings/studium' },
];

// =============================================================================
// TYPE ITEM COMPONENT
// =============================================================================

function TypeItem({
    item,
    onEdit,
    onDelete,
}: {
    item: AssignmentType;
    onEdit: (item: AssignmentType) => void;
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
                                    This action cannot be undone. Assignments using this type will have their type set to null.
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

function TypeDialog({
    item,
    open,
    onOpenChange,
}: {
    item?: AssignmentType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = !!item;
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        color: '#64748b',
        order: 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: item?.name || '',
                slug: item?.slug || '',
                color: item?.color || '#64748b',
                order: item?.order || 0,
            });
        }
    }, [open, item]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/settings/studium/assignment-types/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(`/settings/studium/assignment-types`, {
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
                    <DialogTitle>{isEdit ? 'Edit' : 'Add'} Assignment Type</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the assignment type details below.' : 'Create a new assignment type for your courses.'}
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
                            placeholder="Assignment type name"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="assignment_type_slug"
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

export default function StudiumSettings({ assignmentTypes }: StudiumSettingsProps) {
    const [editingItem, setEditingItem] = useState<AssignmentType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEdit = (item: AssignmentType) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        router.delete(`/settings/studium/assignment-types/${id}`, {
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
            <Head title="Studium Settings" />

            <h1 className="sr-only">Studium Settings</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    <Heading
                        variant="small"
                        title="Studium Settings"
                        description="Kelola tipe tugas untuk mata kuliah Anda"
                    />

                    {/* Assignment Types */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Assignment Types</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tipe tugas (Tugas, Kuis, UTS, UAS, Proyek, dll)
                                </p>
                            </div>
                            <Button size="sm" onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Type
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {assignmentTypes.map((item) => (
                                <TypeItem
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
            <TypeDialog
                item={editingItem}
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
            />
        </AppLayout>
    );
}
