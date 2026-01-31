import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    Briefcase,
    Calendar,
    Folder,
    FolderKanban,
    GraduationCap,
    LayoutGrid,
    Layers,
    MessageSquare,
    Settings,
    Share2,
    Shield,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as calendarIndex } from '@/routes/calendar';
import { index as friendsIndex } from '@/routes/friends';
import type { NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import { index as opusWorkspacesIndex } from '@/routes/opus/workspaces';
import { index as studiumProgramsIndex } from '@/routes/studium/programs';
import { upcoming as studiumUpcoming } from '@/routes/studium/assignments';
import { index as vocatioPipelinesIndex } from '@/routes/vocatio/pipelines';
import { index as vocatioJobsIndex } from '@/routes/vocatio/jobs';
import { index as vocatioSharesIndex } from '@/routes/vocatio/shares';
import { useMemo } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Calendar',
        href: calendarIndex(),
        icon: Calendar,
    },
    {
        title: 'Friends',
        href: friendsIndex(),
        icon: Users,
    },
];

const opusNavItems: NavItem[] = [
    {
        title: 'Workspaces',
        href: opusWorkspacesIndex(),
        icon: Layers,
    },
];

const studiumNavItems: NavItem[] = [
    {
        title: 'Programs',
        href: studiumProgramsIndex(),
        icon: GraduationCap,
    },
    {
        title: 'Upcoming',
        href: studiumUpcoming(),
        icon: Calendar,
    },
];

const vocatioNavItems: NavItem[] = [
    {
        title: 'Pipelines',
        href: vocatioPipelinesIndex(),
        icon: FolderKanban,
    },
    {
        title: 'All Jobs',
        href: vocatioJobsIndex(),
        icon: Briefcase,
    },
    {
        title: 'Shares',
        href: vocatioSharesIndex(),
        icon: Share2,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Activity Logs',
        href: '/admin/activity-logs',
        icon: Activity,
    },
    {
        title: 'Feedbacks',
        href: '/admin/feedbacks',
        icon: MessageSquare,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { userModules, isAdmin } = usePage<SharedData>().props;

    // Determine which modules are enabled based on userModules data
    const enabledModules = useMemo(() => {
        const modules = new Set<string>();
        userModules?.forEach((mod) => {
            if (mod.is_enabled) {
                modules.add(mod.module);
            }
        });
        return modules;
    }, [userModules]);

    // Sort modules by order
    const sortedModules = useMemo(() => {
        return [...(userModules || [])]
            .filter((mod) => mod.is_enabled)
            .sort((a, b) => a.order - b.order);
    }, [userModules]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {sortedModules.map((mod) => {
                    switch (mod.module) {
                        case 'opus':
                            return <NavMain key={mod.module} items={opusNavItems} label="Opus" />;
                        case 'studium':
                            return <NavMain key={mod.module} items={studiumNavItems} label="Studium" />;
                        case 'vocatio':
                            return <NavMain key={mod.module} items={vocatioNavItems} label="Vocatio" />;
                        default:
                            return null;
                    }
                })}
                {isAdmin && <NavMain items={adminNavItems} label="Admin" />}
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
