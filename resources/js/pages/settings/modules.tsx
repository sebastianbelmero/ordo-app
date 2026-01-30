import { Head, router } from '@inertiajs/react';
import { Briefcase, FolderKanban, GraduationCap, GripVertical } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface ModuleConfig {
    key: 'opus' | 'studium' | 'vocatio';
    name: string;
    description: string;
    icon: string;
    color: string;
    is_enabled: boolean;
    order: number;
}

interface ModulesProps {
    modules: ModuleConfig[];
}

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FolderKanban,
    GraduationCap,
    Briefcase,
};

const colorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

const borderColorMap: Record<string, string> = {
    purple: 'border-purple-200 dark:border-purple-800',
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-green-200 dark:border-green-800',
};

// =============================================================================
// BREADCRUMBS
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Modules settings',
        href: '/settings/modules',
    },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Modules({ modules }: ModulesProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleToggle = (moduleKey: string) => {
        setIsLoading(moduleKey);
        router.post(
            `/settings/modules/${moduleKey}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsLoading(null),
            },
        );
    };

    const enabledCount = modules.filter((m) => m.is_enabled).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules settings" />

            <h1 className="sr-only">Modules Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Modules"
                        description="Aktifkan atau nonaktifkan modul yang ingin Anda gunakan"
                    />

                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            {enabledCount} dari {modules.length} modul aktif
                        </p>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module) => {
                            const Icon = iconMap[module.icon] ?? FolderKanban;
                            const iconColor = colorMap[module.color] ?? colorMap.purple;
                            const borderColor = borderColorMap[module.color] ?? borderColorMap.purple;

                            return (
                                <div
                                    key={module.key}
                                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                                        module.is_enabled
                                            ? `${borderColor} bg-card shadow-sm`
                                            : 'border-dashed bg-muted/30'
                                    }`}
                                >
                                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold">{module.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {module.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-sm ${
                                                module.is_enabled
                                                    ? 'font-medium text-green-600 dark:text-green-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {module.is_enabled ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <Switch
                                            checked={module.is_enabled}
                                            onCheckedChange={() => handleToggle(module.key)}
                                            disabled={isLoading === module.key}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                        <h4 className="font-medium">Tips</h4>
                        <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                            <li>
                                <strong>Opus</strong> - Kelola proyek dan tugas dengan tampilan Kanban
                            </li>
                            <li>
                                <strong>Studium</strong> - Kelola program studi, semester, mata kuliah, dan tugas
                            </li>
                            <li>
                                <strong>Vocatio</strong> - Lacak lamaran kerja dan pipeline rekrutmen
                            </li>
                        </ul>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
