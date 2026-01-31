<?php

declare(strict_types=1);

namespace App\Services\Google;

use App\Models\User;
use Google\Client as GoogleClient;
use Google\Service\Calendar;

/**
 * ======================================================================================
 * GOOGLE AUTH SERVICE
 * ======================================================================================
 *
 * Handles OAuth 2.0 authentication flow with Google for per-user calendar access.
 *
 * ======================================================================================
 */
class GoogleAuthService
{
    private ?GoogleClient $client = null;

    /**
     * Get configured Google Client instance.
     */
    private function getClient(): GoogleClient
    {
        if ($this->client === null) {
            $this->client = new GoogleClient;
            $this->client->setClientId(config('services.google.client_id'));
            $this->client->setClientSecret(config('services.google.client_secret'));

            // Build absolute redirect URI
            $redirectUri = config('services.google.calendar_redirect');
            if (! str_starts_with($redirectUri, 'http')) {
                $redirectUri = url($redirectUri);
            }
            $this->client->setRedirectUri($redirectUri);

            $this->client->addScope(Calendar::CALENDAR);
            $this->client->setAccessType('offline');
            $this->client->setPrompt('consent');
        }

        return $this->client;
    }

    /**
     * Get authorization URL for OAuth consent.
     */
    public function getAuthUrl(): string
    {
        return $this->getClient()->createAuthUrl();
    }

    /**
     * Exchange authorization code for tokens.
     *
     * @return array{access_token: string, refresh_token: string, expires_in: int}
     */
    public function exchangeCode(string $code): array
    {
        $token = $this->getClient()->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \Exception('Failed to exchange code: '.($token['error_description'] ?? $token['error']));
        }

        return $token;
    }

    /**
     * Refresh access token using refresh token.
     *
     * @return array{access_token: string, expires_in: int}
     */
    public function refreshToken(string $refreshToken): array
    {
        $client = $this->getClient();
        $client->fetchAccessTokenWithRefreshToken($refreshToken);
        $token = $client->getAccessToken();

        if (isset($token['error'])) {
            throw new \Exception('Failed to refresh token: '.($token['error_description'] ?? $token['error']));
        }

        return $token;
    }

    /**
     * Save tokens to user.
     */
    public function saveTokensToUser(User $user, array $token): void
    {
        $user->update([
            'google_access_token' => $token['access_token'],
            'google_refresh_token' => $token['refresh_token'] ?? $user->google_refresh_token,
            'google_token_expires_at' => now()->addSeconds($token['expires_in'] ?? 3600),
        ]);
    }

    /**
     * Get authenticated client for a user.
     */
    public function getAuthenticatedClient(User $user): GoogleClient
    {
        if (! $user->hasGoogleCalendarConnected()) {
            throw new \Exception('User has not connected Google Calendar');
        }

        $client = $this->getClient();
        $client->setAccessToken([
            'access_token' => $user->google_access_token,
            'refresh_token' => $user->google_refresh_token,
            'expires_in' => $user->google_token_expires_at?->diffInSeconds(now()) ?? 0,
        ]);

        // Refresh token if expired
        if ($user->isGoogleTokenExpired()) {
            $token = $this->refreshToken($user->google_refresh_token);
            $this->saveTokensToUser($user, $token);
            $client->setAccessToken($token);
        }

        return $client;
    }

    /**
     * Disconnect Google Calendar from user.
     */
    public function disconnect(User $user): void
    {
        // Revoke token if possible
        if ($user->google_access_token) {
            try {
                $this->getClient()->revokeToken($user->google_access_token);
            } catch (\Exception $e) {
                // Ignore revocation errors
            }
        }

        $user->update([
            'google_access_token' => null,
            'google_refresh_token' => null,
            'google_token_expires_at' => null,
            'google_calendar_id' => null,
            'google_calendar_enabled' => false,
        ]);
    }
}
