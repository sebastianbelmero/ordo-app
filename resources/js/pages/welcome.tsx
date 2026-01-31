import { Head, Link, usePage } from '@inertiajs/react';
import { Briefcase, Calendar, CheckCircle2, FolderKanban, GraduationCap, LogIn } from 'lucide-react';
import { dashboard, login } from '@/routes';
import type { SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Ordo - All-in-One Productivity Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-8 w-8 fill-current text-foreground" />
                            <span className="text-xl font-semibold text-foreground">Ordo</span>
                        </div>

                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button>
                                    Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-20">
                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            All-in-One Productivity Platform
                        </div>

                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                            Manage Everything
                            <br />
                            <span className="text-muted-foreground">in One Place</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                            Ordo helps students and professionals organize{' '}
                            <span className="font-medium text-foreground">projects</span>,{' '}
                            <span className="font-medium text-foreground">academics</span>, and{' '}
                            <span className="font-medium text-foreground">job applications</span> with seamless Google
                            Calendar integration.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={login()}>
                                <Button size="lg" className="gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Get Started Free
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button variant="outline" size="lg">
                                    Learn More
                                </Button>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-foreground">3</div>
                                <div className="text-sm text-muted-foreground">Powerful Modules</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-foreground">∞</div>
                                <div className="text-sm text-muted-foreground">Projects & Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-foreground">24/7</div>
                                <div className="text-sm text-muted-foreground">Calendar Sync</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="relative border-t py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-foreground">Three Powerful Modules</h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Enable only what you need. Each module is designed to help you excel in different areas of
                                your life.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Opus */}
                            <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                                    <FolderKanban className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Opus</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Project & Task Management</p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        Kanban Board
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        Workspaces & Projects
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        Custom Statuses & Priorities
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        Due Date Tracking
                                    </li>
                                </ul>
                            </div>

                            {/* Studium */}
                            <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Studium</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Academic Management</p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        Program & Semester
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        Course Management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        Assignment Tracker
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        Academic Calendar
                                    </li>
                                </ul>
                            </div>

                            {/* Vocatio */}
                            <div className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/20">
                                    <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Vocatio</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Job Application Tracker</p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Pipeline Management
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Interview Scheduling
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Application Sharing
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Deadline Reminders
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calendar Integration */}
                <section className="relative border-t py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="relative overflow-hidden rounded-xl border bg-card p-8 md:p-12">
                            <div className="relative z-10 grid items-center gap-12 md:grid-cols-2">
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Google Calendar Integration
                                    </div>
                                    <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                                        Never Miss a Deadline
                                    </h2>
                                    <p className="mb-6 text-muted-foreground">
                                        All your tasks, assignments, and job application deadlines are automatically synced
                                        to your Google Calendar. Stay organized across all your devices.
                                    </p>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Real-time sync across all modules
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Smart event recovery
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Per-user OAuth authentication
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex justify-center">
                                    <div className="relative rounded-xl border bg-muted/50 p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-red-500" />
                                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                            <div className="h-3 w-3 rounded-full bg-green-500" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 rounded-lg bg-purple-100 p-3 dark:bg-purple-500/20">
                                                <FolderKanban className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-sm text-foreground">[Task] Website Redesign</span>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-lg bg-blue-100 p-3 dark:bg-blue-500/20">
                                                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm text-foreground">[Assignment] Final Project</span>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-lg bg-green-100 p-3 dark:bg-green-500/20">
                                                <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="text-sm text-foreground">[Job] Google Interview</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative border-t py-24">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-4xl">Ready to Get Organized?</h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                            Join Ordo today and take control of your projects, academics, and career. It's free to get
                            started!
                        </p>
                        <Link href={login()}>
                            <Button size="lg" className="gap-2">
                                <LogIn className="h-5 w-5" />
                                Sign In with Google
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-2">
                                <AppLogoIcon className="h-8 w-8" />
                                <span className="text-lg font-bold text-foreground">Ordo</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Built with Laravel, React & TypeScript</div>
                            <div className="text-sm text-muted-foreground">© 2026 Ordo. All rights reserved.</div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
