<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Google\GoogleAuthService;
use App\Services\Google\GoogleCalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * GOOGLE CALENDAR CONTROLLER
 * ======================================================================================
 *
 * Handles Google Calendar OAuth flow and settings.
 *
 * ======================================================================================
 */
class GoogleCalendarController extends Controller
{
    public function __construct(
        private GoogleAuthService $authService,
        private GoogleCalendarService $calendarService
    ) {}

    /**
     * Show Google Calendar settings.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $calendars = [];

        if ($user->hasGoogleCalendarConnected()) {
            try {
                $calendars = $this->calendarService->listCalendars($user);
            } catch (\Exception $e) {
                // Token might be invalid
                report($e);
            }
        }

        return Inertia::render('settings/google-calendar', [
            'isConnected' => $user->hasGoogleCalendarConnected(),
            'isEnabled' => $user->google_calendar_enabled,
            'selectedCalendarId' => $user->google_calendar_id,
            'calendars' => $calendars,
        ]);
    }

    /**
     * Redirect to Google OAuth consent screen.
     */
    public function connect(): RedirectResponse
    {
        $authUrl = $this->authService->getAuthUrl();

        return redirect()->away($authUrl);
    }

    /**
     * Handle OAuth callback from Google.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            return redirect()
                ->route('settings.google-calendar')
                ->with('error', 'Failed to connect Google Calendar: '.$request->get('error'));
        }

        $code = $request->get('code');

        if (! $code) {
            return redirect()
                ->route('settings.google-calendar')
                ->with('error', 'No authorization code received');
        }

        try {
            $token = $this->authService->exchangeCode($code);
            $this->authService->saveTokensToUser($request->user(), $token);

            return redirect()
                ->route('settings.google-calendar')
                ->with('success', 'Google Calendar connected successfully!');
        } catch (\Exception $e) {
            report($e);

            return redirect()
                ->route('settings.google-calendar')
                ->with('error', 'Failed to connect Google Calendar: '.$e->getMessage());
        }
    }

    /**
     * Disconnect Google Calendar.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $this->authService->disconnect($request->user());

        return redirect()
            ->route('settings.google-calendar')
            ->with('success', 'Google Calendar disconnected');
    }

    /**
     * Update Google Calendar settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'calendar_id' => 'nullable|string',
            'enabled' => 'required|boolean',
        ]);

        $request->user()->update([
            'google_calendar_id' => $validated['calendar_id'],
            'google_calendar_enabled' => $validated['enabled'],
        ]);

        return back()->with('success', 'Google Calendar settings updated');
    }
}
