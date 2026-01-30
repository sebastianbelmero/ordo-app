import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FolderKanban,
    GraduationCap,
    LayoutGrid,
    ListTodo,
    Send,
    TrendingUp,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

// =============================================================================
// TYPES
// =============================================================================

interface UserModule {
    id: number;
    user_id: number;
    module: 'opus' | 'studium' | 'vocatio';
    is_enabled: boolean;
    order: number;
    settings: string | null;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    modules: UserModule[];
    roles: Role[];
}

interface OpusWorkspace {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    color: string;
    projects_count?: number;
}

interface OpusChartData {
    tasksByStatus: { status: string; count: number; color: string }[];
    tasksByPriority: { priority: string; count: number; color: string }[];
}

interface StudiumProgram {
    id: number;
    user_id: number;
    name: string;
    institution: string;
    start_date: string;
    end_date: string;
}

interface StudiumAssignment {
    id: number;
    course_id: number;
    title: string;
    type_id: number;
    deadline: string;
    grade: number | null;
    course?: {
        name: string;
        code: string;
    };
    type?: {
        name: string;
        color: string;
    };
}

interface StudiumChartData {
    assignmentsByType: { type: string; count: number; color: string }[];
    completionStatus: { status: string; count: number; color: string }[];
}

interface VocatioPipeline {
    id: number;
    user_id: number;
    name: string;
    is_default: boolean;
    jobs_count?: number;
}

interface VocatioJobShare {
    id: string;
    message: string | null;
    status: 'pending' | 'accepted' | 'declined';
    job_id: string;
    sender_id: number;
    receiver_id: number;
    job?: {
        company: string;
        position: string;
    };
    sender?: {
        name: string;
    };
}

interface VocatioChartData {
    jobsByStatus: { status: string; count: number; color: string; order: number }[];
    jobsByPipeline: { pipeline: string; count: number }[];
    interestLevels: { level: string; count: number }[];
}

interface DashboardProps {
    user: User;
    opus?: {
        workspaces: { data: OpusWorkspace[] };
        charts: OpusChartData;
    };
    studium?: {
        programs: { data: StudiumProgram[] };
        upcomingAssignments: { data: StudiumAssignment[] };
        charts: StudiumChartData;
    };
    vocatio?: {
        pipelines: { data: VocatioPipeline[] };
        pendingShares: { data: VocatioJobShare[] };
        charts: VocatioChartData;
    };
}

// =============================================================================
// BREADCRUMBS
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div className={`rounded-lg p-3 ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
        </div>
    );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{title}</h2>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
            {children}
        </div>
    );
}

// =============================================================================
// CHART COMPONENTS
// =============================================================================

function TasksByStatusChart({ data }: { data: OpusChartData['tasksByStatus'] }) {
    const chartConfig = data.reduce(
        (acc, item) => {
            acc[item.status] = { label: item.status, color: item.color };
            return acc;
        },
        {} as ChartConfig
    );

    const chartData = data.map((item) => ({
        name: item.status,
        value: item.count,
        fill: item.color,
    }));

    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}

function TasksByPriorityChart({ data }: { data: OpusChartData['tasksByPriority'] }) {
    const chartConfig = data.reduce(
        (acc, item) => {
            acc[item.priority] = { label: item.priority, color: item.color };
            return acc;
        },
        {} as ChartConfig
    );

    const chartData = data.map((item) => ({
        priority: item.priority,
        count: item.count,
        fill: item.color,
    }));

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="priority" type="category" tickLine={false} axisLine={false} width={80} />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

function AssignmentsByTypeChart({ data }: { data: StudiumChartData['assignmentsByType'] }) {
    const chartConfig = data.reduce(
        (acc, item) => {
            acc[item.type] = { label: item.type, color: item.color };
            return acc;
        },
        {} as ChartConfig
    );

    const chartData = data.map((item) => ({
        name: item.type,
        value: item.count,
        fill: item.color,
    }));

    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" strokeWidth={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}

function CompletionStatusChart({ data }: { data: StudiumChartData['completionStatus'] }) {
    const chartConfig = {
        Completed: { label: 'Completed', color: '#22c55e' },
        Pending: { label: 'Pending', color: '#f59e0b' },
    } satisfies ChartConfig;

    const chartData = data.map((item) => ({
        name: item.status,
        value: item.count,
        fill: item.color,
    }));

    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}

function JobsByStatusChart({ data }: { data: VocatioChartData['jobsByStatus'] }) {
    const chartConfig = data.reduce(
        (acc, item) => {
            acc[item.status] = { label: item.status, color: item.color };
            return acc;
        },
        {} as ChartConfig
    );

    const filteredData = data.filter((item) => item.count > 0);
    const chartData = filteredData.map((item) => ({
        status: item.status,
        count: item.count,
        fill: item.color,
    }));

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}

function JobsByPipelineChart({ data }: { data: VocatioChartData['jobsByPipeline'] }) {
    const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];
    const chartConfig = data.reduce(
        (acc, item, index) => {
            acc[item.pipeline] = { label: item.pipeline, color: colors[index % colors.length] };
            return acc;
        },
        {} as ChartConfig
    );

    const chartData = data.map((item, index) => ({
        name: item.pipeline,
        value: item.count,
        fill: colors[index % colors.length],
    }));

    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Dashboard({ user, opus, studium, vocatio }: DashboardProps) {
    const enabledModules = user.modules?.filter((m) => m.is_enabled).map((m) => m.module) ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold">Selamat datang, {user.name}</h1>
                    <p className="mt-1 text-blue-100">
                        {enabledModules.length} modul aktif:{' '}
                        {enabledModules.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {opus && (
                        <StatCard
                            title="Workspaces"
                            value={opus.workspaces.data.length}
                            icon={LayoutGrid}
                            color="bg-blue-500"
                        />
                    )}
                    {studium && (
                        <>
                            <StatCard
                                title="Programs"
                                value={studium.programs.data.length}
                                icon={GraduationCap}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Upcoming Assignments"
                                value={studium.upcomingAssignments.data.length}
                                icon={Calendar}
                                color="bg-amber-500"
                            />
                        </>
                    )}
                    {vocatio && (
                        <StatCard
                            title="Pipelines"
                            value={vocatio.pipelines.data.length}
                            icon={Briefcase}
                            color="bg-green-500"
                        />
                    )}
                </div>

                {/* Charts Section */}
                {(opus?.charts || studium?.charts || vocatio?.charts) && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {opus?.charts && (
                            <>
                                <ChartCard title="Tasks by Status">
                                    <TasksByStatusChart data={opus.charts.tasksByStatus} />
                                </ChartCard>
                                <ChartCard title="Tasks by Priority">
                                    <TasksByPriorityChart data={opus.charts.tasksByPriority} />
                                </ChartCard>
                            </>
                        )}
                        {studium?.charts && (
                            <>
                                <ChartCard title="Assignments by Type">
                                    <AssignmentsByTypeChart data={studium.charts.assignmentsByType} />
                                </ChartCard>
                                <ChartCard title="Assignment Completion">
                                    <CompletionStatusChart data={studium.charts.completionStatus} />
                                </ChartCard>
                            </>
                        )}
                        {vocatio?.charts && (
                            <>
                                <ChartCard title="Jobs by Status">
                                    <JobsByStatusChart data={vocatio.charts.jobsByStatus} />
                                </ChartCard>
                                <ChartCard title="Jobs by Pipeline">
                                    <JobsByPipelineChart data={vocatio.charts.jobsByPipeline} />
                                </ChartCard>
                            </>
                        )}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Opus Section */}
                    {opus && opus.workspaces.data.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                            <SectionHeader title="Opus - Workspaces" icon={FolderKanban} />
                            <div className="space-y-3">
                                {opus.workspaces.data.map((workspace) => (
                                    <div
                                        key={workspace.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: workspace.color }}
                                            />
                                            <span className="font-medium">{workspace.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {workspace.projects_count ?? 0} projects
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Studium - Programs Section */}
                    {studium && studium.programs.data.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                            <SectionHeader title="Studium - Programs" icon={GraduationCap} />
                            <div className="space-y-3">
                                {studium.programs.data.map((program) => (
                                    <div
                                        key={program.id}
                                        className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">{program.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <Building2 className="mr-1 inline h-3 w-3" />
                                                    {program.institution}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                {new Date(program.start_date).getFullYear()} -{' '}
                                                {new Date(program.end_date).getFullYear()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Studium - Upcoming Assignments */}
                    {studium && studium.upcomingAssignments.data.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                            <SectionHeader title="Upcoming Assignments" icon={ListTodo} />
                            <div className="space-y-3">
                                {studium.upcomingAssignments.data.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            {assignment.grade !== null ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-amber-500" />
                                            )}
                                            <div>
                                                <p className="font-medium">{assignment.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignment.course?.name ?? `Course #${assignment.course_id}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {assignment.type && (
                                                <span
                                                    className="rounded-full px-2 py-1 text-xs text-white"
                                                    style={{ backgroundColor: assignment.type.color }}
                                                >
                                                    {assignment.type.name}
                                                </span>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vocatio - Pipelines Section */}
                    {vocatio && vocatio.pipelines.data.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                            <SectionHeader title="Vocatio - Pipelines" icon={TrendingUp} />
                            <div className="space-y-3">
                                {vocatio.pipelines.data.map((pipeline) => (
                                    <div
                                        key={pipeline.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-5 w-5 text-green-500" />
                                            <span className="font-medium">{pipeline.name}</span>
                                            {pipeline.is_default && (
                                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {pipeline.jobs_count ?? 0} jobs
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vocatio - Pending Shares */}
                    {vocatio && vocatio.pendingShares.data.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                            <SectionHeader title="Pending Job Shares" icon={Send} />
                            <div className="space-y-3">
                                {vocatio.pendingShares.data.map((share) => (
                                    <div
                                        key={share.id}
                                        className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {share.job?.position ?? 'Job Position'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {share.job?.company ?? 'Company'} • From{' '}
                                                    {share.sender?.name ?? 'Someone'}
                                                </p>
                                                {share.message && (
                                                    <p className="mt-2 text-sm italic text-muted-foreground">
                                                        "{share.message}"
                                                    </p>
                                                )}
                                            </div>
                                            <span className="rounded-full bg-amber-200 px-2 py-1 text-xs text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {enabledModules.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                        <LayoutGrid className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Tidak ada modul aktif</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Aktifkan modul Opus, Studium, atau Vocatio untuk mulai menggunakan Ordo.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
