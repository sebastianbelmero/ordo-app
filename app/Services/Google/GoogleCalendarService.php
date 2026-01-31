<?php

declare(strict_types=1);

namespace App\Services\Google;

use App\Models\User;
use Carbon\Carbon;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;

/**
 * ======================================================================================
 * GOOGLE CALENDAR SERVICE
 * ======================================================================================
 *
 * Handles CRUD operations for Google Calendar events.
 *
 * ======================================================================================
 */
class GoogleCalendarService
{
    public function __construct(
        private GoogleAuthService $authService
    ) {}

    /**
     * Get Google Calendar service for a user.
     */
    private function getCalendarService(User $user): Calendar
    {
        $client = $this->authService->getAuthenticatedClient($user);

        return new Calendar($client);
    }

    /**
     * Get calendar ID for user (primary or selected).
     */
    private function getCalendarId(User $user): string
    {
        return $user->google_calendar_id ?? 'primary';
    }

    /**
     * List user's calendars.
     *
     * @return array<int, array{id: string, summary: string, primary: bool}>
     */
    public function listCalendars(User $user): array
    {
        $service = $this->getCalendarService($user);
        $calendarList = $service->calendarList->listCalendarList();

        $calendars = [];
        foreach ($calendarList->getItems() as $calendar) {
            $calendars[] = [
                'id' => $calendar->getId(),
                'summary' => $calendar->getSummary(),
                'primary' => $calendar->getPrimary() ?? false,
                'background_color' => $calendar->getBackgroundColor(),
            ];
        }

        return $calendars;
    }

    /**
     * Get events from Google Calendar.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getEvents(User $user, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $service = $this->getCalendarService($user);
        $calendarId = $this->getCalendarId($user);

        $params = [
            'singleEvents' => true,
            'orderBy' => 'startTime',
            'maxResults' => 250,
        ];

        if ($startDate) {
            $params['timeMin'] = $startDate->toRfc3339String();
        }
        if ($endDate) {
            $params['timeMax'] = $endDate->toRfc3339String();
        }

        $events = $service->events->listEvents($calendarId, $params);

        $result = [];
        foreach ($events->getItems() as $event) {
            $result[] = $this->formatEvent($event);
        }

        return $result;
    }

    /**
     * Create an event in Google Calendar.
     *
     * @return array<string, mixed>
     */
    public function createEvent(
        User $user,
        string $title,
        Carbon $startDateTime,
        ?Carbon $endDateTime = null,
        ?string $description = null,
        bool $allDay = false
    ): array {
        $service = $this->getCalendarService($user);
        $calendarId = $this->getCalendarId($user);

        $event = new Event;
        $event->setSummary($title);

        if ($description) {
            $event->setDescription($description);
        }

        $endDateTime = $endDateTime ?? $startDateTime->copy()->addHour();

        if ($allDay) {
            $start = new EventDateTime;
            $start->setDate($startDateTime->format('Y-m-d'));
            $event->setStart($start);

            $end = new EventDateTime;
            $end->setDate($endDateTime->format('Y-m-d'));
            $event->setEnd($end);
        } else {
            $start = new EventDateTime;
            $start->setDateTime($startDateTime->toRfc3339String());
            $start->setTimeZone($startDateTime->timezone->getName());
            $event->setStart($start);

            $end = new EventDateTime;
            $end->setDateTime($endDateTime->toRfc3339String());
            $end->setTimeZone($endDateTime->timezone->getName());
            $event->setEnd($end);
        }

        $createdEvent = $service->events->insert($calendarId, $event);

        return $this->formatEvent($createdEvent);
    }

    /**
     * Update an event in Google Calendar.
     *
     * @return array<string, mixed>
     */
    public function updateEvent(
        User $user,
        string $eventId,
        string $title,
        Carbon $startDateTime,
        ?Carbon $endDateTime = null,
        ?string $description = null,
        bool $allDay = false
    ): array {
        $service = $this->getCalendarService($user);
        $calendarId = $this->getCalendarId($user);

        $event = $service->events->get($calendarId, $eventId);
        $event->setSummary($title);
        $event->setStatus('confirmed'); // Restore if cancelled

        if ($description !== null) {
            $event->setDescription($description);
        }

        $endDateTime = $endDateTime ?? $startDateTime->copy()->addHour();

        if ($allDay) {
            $start = new EventDateTime;
            $start->setDate($startDateTime->format('Y-m-d'));
            $event->setStart($start);

            $end = new EventDateTime;
            $end->setDate($endDateTime->format('Y-m-d'));
            $event->setEnd($end);
        } else {
            $start = new EventDateTime;
            $start->setDateTime($startDateTime->toRfc3339String());
            $start->setTimeZone($startDateTime->timezone->getName());
            $event->setStart($start);

            $end = new EventDateTime;
            $end->setDateTime($endDateTime->toRfc3339String());
            $end->setTimeZone($endDateTime->timezone->getName());
            $event->setEnd($end);
        }

        $updatedEvent = $service->events->update($calendarId, $eventId, $event);

        return $this->formatEvent($updatedEvent);
    }

    /**
     * Delete an event from Google Calendar.
     */
    public function deleteEvent(User $user, string $eventId): void
    {
        $service = $this->getCalendarService($user);
        $calendarId = $this->getCalendarId($user);

        $service->events->delete($calendarId, $eventId);
    }

    /**
     * Format event to array.
     *
     * @return array<string, mixed>
     */
    private function formatEvent(Event $event): array
    {
        $start = $event->getStart();
        $end = $event->getEnd();

        // Check if it's an all-day event
        $allDay = $start->getDate() !== null;

        return [
            'id' => $event->getId(),
            'title' => $event->getSummary() ?? '(No title)',
            'description' => $event->getDescription(),
            'start' => $allDay ? $start->getDate() : $start->getDateTime(),
            'end' => $allDay ? $end->getDate() : $end->getDateTime(),
            'all_day' => $allDay,
            'html_link' => $event->getHtmlLink(),
            'status' => $event->getStatus(),
            'created' => $event->getCreated(),
            'updated' => $event->getUpdated(),
        ];
    }

    /**
     * Sync an assignment to Google Calendar.
     */
    public function syncAssignment(User $user, array $assignment, ?string $existingEventId = null): ?string
    {
        if (! $user->google_calendar_enabled || ! $user->hasGoogleCalendarConnected()) {
            return null;
        }

        $title = "[Assignment] {$assignment['title']}";
        $description = $assignment['description'] ?? '';
        $deadline = Carbon::parse($assignment['deadline']);

        try {
            if ($existingEventId) {
                try {
                    $event = $this->updateEvent($user, $existingEventId, $title, $deadline, null, $description, true);

                    return $event['id'];
                } catch (\Google\Service\Exception $e) {
                    // Event not found (deleted in Google Calendar), create new one
                    if ($e->getCode() === 404 || $e->getCode() === 410) {
                        $event = $this->createEvent($user, $title, $deadline, null, $description, true);

                        return $event['id'];
                    }
                    throw $e;
                }
            } else {
                $event = $this->createEvent($user, $title, $deadline, null, $description, true);

                return $event['id'];
            }
        } catch (\Exception $e) {
            report($e);

            return null;
        }
    }

    /**
     * Sync a task to Google Calendar.
     */
    public function syncTask(User $user, array $task, ?string $existingEventId = null): ?string
    {
        if (! $user->google_calendar_enabled || ! $user->hasGoogleCalendarConnected()) {
            return null;
        }

        if (empty($task['due_date'])) {
            return null;
        }

        $title = "[Task] {$task['title']}";
        $description = $task['description'] ?? '';
        $dueDate = Carbon::parse($task['due_date']);

        try {
            if ($existingEventId) {
                try {
                    $event = $this->updateEvent($user, $existingEventId, $title, $dueDate, null, $description, true);

                    return $event['id'];
                } catch (\Google\Service\Exception $e) {
                    // Event not found (deleted in Google Calendar), create new one
                    if ($e->getCode() === 404 || $e->getCode() === 410) {
                        $event = $this->createEvent($user, $title, $dueDate, null, $description, true);

                        return $event['id'];
                    }
                    throw $e;
                }
            } else {
                $event = $this->createEvent($user, $title, $dueDate, null, $description, true);

                return $event['id'];
            }
        } catch (\Exception $e) {
            report($e);

            return null;
        }
    }

    /**
     * Sync a job deadline to Google Calendar.
     */
    public function syncJob(User $user, array $job, ?string $existingEventId = null): ?string
    {
        if (! $user->google_calendar_enabled || ! $user->hasGoogleCalendarConnected()) {
            return null;
        }

        if (empty($job['due_date'])) {
            return null;
        }

        $title = "[Job] {$job['company']} - {$job['position']}";
        $description = $job['notes'] ?? '';
        $dueDate = Carbon::parse($job['due_date']);

        try {
            if ($existingEventId) {
                try {
                    $event = $this->updateEvent($user, $existingEventId, $title, $dueDate, null, $description, true);

                    return $event['id'];
                } catch (\Google\Service\Exception $e) {
                    // Event not found (deleted in Google Calendar), create new one
                    if ($e->getCode() === 404 || $e->getCode() === 410) {
                        $event = $this->createEvent($user, $title, $dueDate, null, $description, true);

                        return $event['id'];
                    }
                    throw $e;
                }
            } else {
                $event = $this->createEvent($user, $title, $dueDate, null, $description, true);

                return $event['id'];
            }
        } catch (\Exception $e) {
            report($e);

            return null;
        }
    }

    /**
     * Remove an event from Google Calendar.
     */
    public function removeEvent(User $user, ?string $eventId): void
    {
        if (! $eventId || ! $user->google_calendar_enabled || ! $user->hasGoogleCalendarConnected()) {
            return;
        }

        try {
            $this->deleteEvent($user, $eventId);
        } catch (\Exception $e) {
            report($e);
        }
    }
}
