<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, LogsActivity, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'google_access_token',
        'google_refresh_token',
        'google_token_expires_at',
        'google_calendar_id',
        'google_calendar_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'google_access_token',
        'google_refresh_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'google_token_expires_at' => 'datetime',
            'google_calendar_enabled' => 'boolean',
            'google_access_token' => 'encrypted',
            'google_refresh_token' => 'encrypted',
        ];
    }

    /**
     * Configure activity log options.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get the user's modules.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(UserModule::class);
    }

    /**
     * Get friend requests sent by this user.
     */
    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id');
    }

    /**
     * Get friend requests received by this user.
     */
    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'receiver_id');
    }

    /**
     * Get all accepted friends (both directions).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    public function friends()
    {
        $sentFriendIds = Friendship::where('sender_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('receiver_id');

        $receivedFriendIds = Friendship::where('receiver_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('sender_id');

        return User::whereIn('id', $sentFriendIds->merge($receivedFriendIds))
            ->orderBy('name')
            ->get();
    }

    /**
     * Check if user is friends with another user.
     */
    public function isFriendsWith(int $userId): bool
    {
        return Friendship::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where(function ($q) use ($userId) {
                    $q->where('sender_id', $this->id)
                        ->where('receiver_id', $userId);
                })->orWhere(function ($q) use ($userId) {
                    $q->where('sender_id', $userId)
                        ->where('receiver_id', $this->id);
                });
            })
            ->exists();
    }

    /**
     * Check if Google Calendar is connected.
     */
    public function hasGoogleCalendarConnected(): bool
    {
        return ! empty($this->google_access_token) && ! empty($this->google_refresh_token);
    }

    /**
     * Check if Google token is expired.
     */
    public function isGoogleTokenExpired(): bool
    {
        if (! $this->google_token_expires_at) {
            return true;
        }

        return $this->google_token_expires_at->isPast();
    }
}
