import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg, EventApi } from '@fullcalendar/core';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { Calendar, Plus, Settings, ExternalLink, AlertCircle } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    url?: string;
    extendedProps?: {
        description?: string;
        status?: string;
    };
}

interface CalendarIndexProps {
    isConnected: boolean;
    isEnabled: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
];

export default function CalendarIndex({ isConnected, isEnabled }: CalendarIndexProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Event modal state
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch events
    const fetchEvents = useCallback(async (start: Date, end: Date) => {
        if (!isConnected || !isEnabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError('Failed to load calendar events');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, isEnabled]);

    // Handle date range change
    const handleDatesSet = useCallback((arg: { start: Date; end: Date }) => {
        fetchEvents(arg.start, arg.end);
    }, [fetchEvents]);

    // Handle event click
    const handleEventClick = (arg: EventClickArg) => {
        arg.jsEvent.preventDefault();
        const event = arg.event;

        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
            url: event.url,
            extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
        });

        setFormData({
            title: event.title,
            description: event.extendedProps?.description || '',
            start: event.allDay 
                ? event.startStr 
                : event.start?.toISOString().slice(0, 16) || '',
            end: event.allDay 
                ? event.endStr 
                : event.end?.toISOString().slice(0, 16) || '',
            allDay: event.allDay,
        });

        setIsEditing(true);
        setIsEventModalOpen(true);
    };

    // Handle date select (create new event)
    const handleDateSelect = (arg: DateSelectArg) => {
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            start: arg.allDay 
                ? arg.startStr 
                : arg.start.toISOString().slice(0, 16),
            end: arg.allDay 
                ? arg.endStr 
                : arg.end.toISOString().slice(0, 16),
            allDay: arg.allDay,
        });
        setIsEditing(false);
        setIsEventModalOpen(true);
    };

    // Save event
    const handleSaveEvent = async () => {
        if (!formData.title.trim()) return;

        setIsSaving(true);
        try {
            const url = isEditing 
                ? `/calendar/events/${selectedEvent?.id}` 
                : '/calendar/events';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    start: formData.start,
                    end: formData.end || undefined,
                    all_day: formData.allDay,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save event');
            }

            // Refresh events
            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
                const view = calendarApi.view;
                fetchEvents(view.activeStart, view.activeEnd);
            }

            setIsEventModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save event');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete event
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/calendar/events/${selectedEvent.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            // Refresh events
            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
                const view = calendarApi.view;
                fetchEvents(view.activeStart, view.activeEnd);
            }

            setIsDeleteDialogOpen(false);
            setIsEventModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to delete event');
        } finally {
            setIsSaving(false);
        }
    };

    // Not connected state
    if (!isConnected) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Calendar" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Connect Google Calendar</h2>
                    <p className="text-center text-muted-foreground max-w-md">
                        Connect your Google Calendar to view and manage your events, assignments, and deadlines in one place.
                    </p>
                    <Link href="/settings/google-calendar">
                        <Button>
                            <Settings className="mr-2 h-4 w-4" />
                            Go to Settings
                        </Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // Connected but not enabled
    if (!isEnabled) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Calendar" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-semibold">Calendar Sync Disabled</h2>
                    <p className="text-center text-muted-foreground max-w-md">
                        Your Google Calendar is connected but sync is disabled. Enable it in settings to view your events.
                    </p>
                    <Link href="/settings/google-calendar">
                        <Button>
                            <Settings className="mr-2 h-4 w-4" />
                            Enable in Settings
                        </Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex h-full flex-1 flex-col gap-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage your Google Calendar events
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setSelectedEvent(null);
                                setFormData({
                                    title: '',
                                    description: '',
                                    start: new Date().toISOString().slice(0, 16),
                                    end: '',
                                    allDay: false,
                                });
                                setIsEditing(false);
                                setIsEventModalOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Event
                        </Button>
                        <Link href="/settings/google-calendar">
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Calendar */}
                <div className="flex-1 rounded-lg border bg-card p-4">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        select={handleDateSelect}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        datesSet={handleDatesSet}
                        height="auto"
                        loading={(loading) => setIsLoading(loading)}
                        eventClassNames="cursor-pointer"
                    />
                </div>
            </div>

            {/* Event Modal */}
            <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Event' : 'New Event'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing 
                                ? 'Update event details or delete this event'
                                : 'Create a new event in your Google Calendar'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="event-title">Title</Label>
                            <Input
                                id="event-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Event title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event-description">Description</Label>
                            <Textarea
                                id="event-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Event description (optional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="all-day"
                                checked={formData.allDay}
                                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
                            />
                            <Label htmlFor="all-day">All-day event</Label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="event-start">Start</Label>
                                <Input
                                    id="event-start"
                                    type={formData.allDay ? 'date' : 'datetime-local'}
                                    value={formData.allDay 
                                        ? formData.start.slice(0, 10) 
                                        : formData.start
                                    }
                                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event-end">End</Label>
                                <Input
                                    id="event-end"
                                    type={formData.allDay ? 'date' : 'datetime-local'}
                                    value={formData.allDay 
                                        ? formData.end.slice(0, 10) 
                                        : formData.end
                                    }
                                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                />
                            </div>
                        </div>

                        {isEditing && selectedEvent?.url && (
                            <a 
                                href={selectedEvent.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open in Google Calendar
                            </a>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        {isEditing && (
                            <Button 
                                variant="destructive" 
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={isSaving}
                            >
                                Delete
                            </Button>
                        )}
                        <Button 
                            onClick={handleSaveEvent} 
                            disabled={isSaving || !formData.title.trim()}
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
