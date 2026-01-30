import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler } from 'react';

// =============================================================================
// TYPES
// =============================================================================

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CreatePipeline() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vocatio', href: '/vocatio' },
        { title: 'Pipelines', href: '/vocatio/pipelines' },
        { title: 'Create', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        color: '#3b82f6',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/vocatio/pipelines');
    };

    const colorOptions = [
        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pipeline" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/vocatio/pipelines')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Pipeline</h1>
                        <p className="text-muted-foreground">Create a new job tracking pipeline</p>
                    </div>
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
                                onClick={() => router.visit('/vocatio/pipelines')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Pipeline
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
