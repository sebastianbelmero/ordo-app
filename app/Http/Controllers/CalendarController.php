<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Google\GoogleCalendarService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * CALENDAR CONTROLLER
 * ======================================================================================
 *
 * Handles the calendar view page showing Google Calendar events.
 *
 * ======================================================================================
 */
class CalendarController extends Controller
{
    public function __construct(
        private GoogleCalendarService $calendarService
    ) {}

    /**
     * Display calendar view.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Calendar/Index', [
            'isConnected' => $user->hasGoogleCalendarConnected(),
            'isEnabled' => $user->google_calendar_enabled,
        ]);
    }

    /**
     * Get events for calendar (JSON API for FullCalendar).
     */
    public function events(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasGoogleCalendarConnected() || ! $user->google_calendar_enabled) {
            return response()->json([]);
        }

        $start = $request->has('start')
            ? Carbon::parse($request->get('start'))
            : Carbon::now()->startOfMonth();

        $end = $request->has('end')
            ? Carbon::parse($request->get('end'))
            : Carbon::now()->endOfMonth();

        try {
            $events = $this->calendarService->getEvents($user, $start, $end);

            // Format for FullCalendar
            $formattedEvents = array_map(function ($event) {
                return [
                    'id' => $event['id'],
                    'title' => $event['title'],
                    'start' => $event['start'],
                    'end' => $event['end'],
                    'allDay' => $event['all_day'],
                    'url' => $event['html_link'],
                    'extendedProps' => [
                        'description' => $event['description'],
                        'status' => $event['status'],
                    ],
                ];
            }, $events);

            return response()->json($formattedEvents);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => 'Failed to fetch events'], 500);
        }
    }

    /**
     * Create a new event.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasGoogleCalendarConnected() || ! $user->google_calendar_enabled) {
            return response()->json(['error' => 'Google Calendar not connected'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end' => 'nullable|date|after_or_equal:start',
            'description' => 'nullable|string',
            'all_day' => 'boolean',
        ]);

        try {
            $event = $this->calendarService->createEvent(
                $user,
                $validated['title'],
                Carbon::parse($validated['start']),
                isset($validated['end']) ? Carbon::parse($validated['end']) : null,
                $validated['description'] ?? null,
                $validated['all_day'] ?? false
            );

            return response()->json($event);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => 'Failed to create event'], 500);
        }
    }

    /**
     * Update an event.
     */
    public function update(Request $request, string $eventId): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasGoogleCalendarConnected() || ! $user->google_calendar_enabled) {
            return response()->json(['error' => 'Google Calendar not connected'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end' => 'nullable|date|after_or_equal:start',
            'description' => 'nullable|string',
            'all_day' => 'boolean',
        ]);

        try {
            $event = $this->calendarService->updateEvent(
                $user,
                $eventId,
                $validated['title'],
                Carbon::parse($validated['start']),
                isset($validated['end']) ? Carbon::parse($validated['end']) : null,
                $validated['description'] ?? null,
                $validated['all_day'] ?? false
            );

            return response()->json($event);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => 'Failed to update event'], 500);
        }
    }

    /**
     * Delete an event.
     */
    public function destroy(Request $request, string $eventId): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasGoogleCalendarConnected() || ! $user->google_calendar_enabled) {
            return response()->json(['error' => 'Google Calendar not connected'], 403);
        }

        try {
            $this->calendarService->deleteEvent($user, $eventId);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => 'Failed to delete event'], 500);
        }
    }
}
