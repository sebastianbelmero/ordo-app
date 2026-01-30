<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Activitylog\Facades\CauserResolver;

/**
 * ======================================================================================
 * SOCIALITE CONTROLLER
 * ======================================================================================
 *
 * Controller untuk menangani OAuth authentication dengan Google.
 * Hanya Google login yang diizinkan, tidak ada registrasi manual.
 *
 * ======================================================================================
 */
class SocialiteController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Failed to authenticate with Google. Please try again.');
        }

        // Find existing user by google_id or email
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            // Update google_id and avatar if not set
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'name' => $user->name ?: $googleUser->getName(),
            ]);
        } else {
            // Create new user
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
            ]);

            // Assign default user role
            $user->assignRole('user');

            // Check if this is the admin email
            if ($user->email === 'sebastianbelmerositorus@gmail.com') {
                $user->assignRole('admin');
            }

            // Log the registration
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['method' => 'google_oauth'])
                ->log('User registered via Google OAuth');
        }

        // Log the user in
        Auth::login($user, remember: true);

        // Log the login activity
        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('User logged in via Google OAuth');

        return redirect()->intended('/dashboard');
    }

    /**
     * Logout user.
     */
    public function logout(): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->log('User logged out');
        }

        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/');
    }
}
