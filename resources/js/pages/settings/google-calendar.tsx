import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { Calendar, Link2, Unlink, ExternalLink, Check } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface CalendarOption {
    id: string;
    summary: string;
    primary: boolean;
    background_color: string;
}

interface GoogleCalendarProps {
    isConnected: boolean;
    isEnabled: boolean;
    selectedCalendarId: string | null;
    calendars: CalendarOption[];
}

// =============================================================================
// COMPONENT
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Google Calendar settings', href: '/settings/google-calendar' },
];

export default function GoogleCalendar({
    isConnected,
    isEnabled,
    selectedCalendarId,
    calendars,
}: GoogleCalendarProps) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const form = useForm({
        calendar_id: selectedCalendarId ?? '',
        enabled: isEnabled,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put('/settings/google-calendar');
    };

    const handleDisconnect = () => {
        if (confirm('Are you sure you want to disconnect Google Calendar?')) {
            setIsDisconnecting(true);
            router.post('/google-calendar/disconnect', {}, {
                onFinish: () => setIsDisconnecting(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Google Calendar settings" />

            <h1 className="sr-only">Google Calendar Settings</h1>

            <SettingsLayout>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Google Calendar"
                    description="Connect your Google Calendar to sync events with your tasks, assignments, and job applications."
                />

                {/* Connection Status */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                isConnected 
                                    ? 'bg-green-100 dark:bg-green-900/30' 
                                    : 'bg-muted'
                            }`}>
                                <Calendar className={`h-6 w-6 ${
                                    isConnected 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-muted-foreground'
                                }`} />
                            </div>
                            <div>
                                <h3 className="font-medium">
                                    {isConnected ? 'Connected' : 'Not Connected'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isConnected 
                                        ? 'Your Google Calendar is connected and ready to sync'
                                        : 'Connect your Google account to enable calendar sync'
                                    }
                                </p>
                            </div>
                        </div>

                        {isConnected ? (
                            <Button 
                                variant="outline" 
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                            >
                                <Unlink className="mr-2 h-4 w-4" />
                                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                        ) : (
                            <Button asChild>
                                <a href="/google-calendar/connect">
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Connect Google Calendar
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Settings (only show when connected) */}
                {isConnected && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-lg border bg-card p-6 space-y-6">
                            <h3 className="font-medium">Sync Settings</h3>

                            {/* Enable/Disable Sync */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sync-enabled">Enable Calendar Sync</Label>
                                    <p className="text-sm text-muted-foreground">
                                        When enabled, your tasks and events will sync with Google Calendar
                                    </p>
                                </div>
                                <Switch
                                    id="sync-enabled"
                                    checked={form.data.enabled}
                                    onCheckedChange={(checked) => form.setData('enabled', checked)}
                                />
                            </div>

                            {/* Calendar Selection */}
                            {form.data.enabled && calendars.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="calendar-select">Select Calendar</Label>
                                    <Select
                                        value={form.data.calendar_id || 'primary'}
                                        onValueChange={(value) => form.setData('calendar_id', value === 'primary' ? '' : value)}
                                    >
                                        <SelectTrigger id="calendar-select">
                                            <SelectValue placeholder="Select a calendar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {calendars.map((calendar) => (
                                                <SelectItem key={calendar.id} value={calendar.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: calendar.background_color }}
                                                        />
                                                        {calendar.summary}
                                                        {calendar.primary && (
                                                            <span className="text-xs text-muted-foreground">(Primary)</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Events from Ordo will be added to this calendar
                                    </p>
                                </div>
                            )}

                            <Button type="submit" disabled={form.processing}>
                                <Check className="mr-2 h-4 w-4" />
                                Save Settings
                            </Button>
                        </div>
                    </form>
                )}

                {/* What syncs */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-medium mb-4">What Gets Synced</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Studium</p>
                                <p className="text-xs text-muted-foreground">Assignment deadlines</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Opus</p>
                                <p className="text-xs text-muted-foreground">Task due dates</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Vocatio</p>
                                <p className="text-xs text-muted-foreground">Job deadlines & interviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Calendar Link */}
                {isConnected && isEnabled && (
                    <div className="flex justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/calendar">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Calendar
                            </Link>
                        </Button>
                    </div>
                )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
