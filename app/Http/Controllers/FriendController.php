<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * FRIEND CONTROLLER
 * ======================================================================================
 *
 * Controller untuk manajemen pertemanan.
 *
 * ======================================================================================
 */
class FriendController extends Controller
{
    /**
     * Display friends list.
     *
     * Route: GET /friends
     * View: Pages/Friends/Index.tsx
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Friends/Index', [
            'friends' => $user->friends()->map(fn ($friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
                'avatar' => $friend->avatar,
            ]),
            'pendingReceived' => Friendship::where('receiver_id', $user->id)
                ->where('status', 'pending')
                ->with('sender:id,name,email,avatar')
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'sender' => $f->sender,
                    'created_at' => $f->created_at->toISOString(),
                ]),
            'pendingSent' => Friendship::where('sender_id', $user->id)
                ->where('status', 'pending')
                ->with('receiver:id,name,email,avatar')
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'receiver' => $f->receiver,
                    'created_at' => $f->created_at->toISOString(),
                ]),
        ]);
    }

    /**
     * Show add friend form with user search.
     *
     * Route: GET /friends/add
     * View: Pages/Friends/Add.tsx
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $search = $request->query('search', '');

        // Get users to show (exclude self, existing friends, and pending requests)
        $existingFriendIds = $user->friends()->pluck('id')->toArray();
        $pendingIds = Friendship::where(function ($q) use ($user) {
            $q->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })
            ->where('status', 'pending')
            ->get()
            ->flatMap(fn ($f) => [$f->sender_id, $f->receiver_id])
            ->unique()
            ->toArray();

        $excludeIds = array_merge([$user->id], $existingFriendIds, $pendingIds);

        $users = [];
        if ($search) {
            $users = User::whereNotIn('id', $excludeIds)
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->select('id', 'name', 'email', 'avatar')
                ->limit(20)
                ->get()
                ->toArray();
        }

        return Inertia::render('Friends/Add', [
            'users' => $users,
            'search' => $search,
        ]);
    }

    /**
     * Send friend request.
     *
     * Route: POST /friends
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();
        $receiverId = $request->input('receiver_id');

        // Cannot send friend request to self
        if ($user->id === (int) $receiverId) {
            return back()->with('error', 'You cannot send a friend request to yourself.');
        }

        // Check if already friends or pending
        $existing = Friendship::where(function ($q) use ($user, $receiverId) {
            $q->where('sender_id', $user->id)
                ->where('receiver_id', $receiverId);
        })->orWhere(function ($q) use ($user, $receiverId) {
            $q->where('sender_id', $receiverId)
                ->where('receiver_id', $user->id);
        })->first();

        if ($existing) {
            return back()->with('error', 'Friend request already exists or you are already friends.');
        }

        Friendship::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        return redirect()
            ->route('friends.index')
            ->with('success', 'Friend request sent!');
    }

    /**
     * Respond to friend request.
     *
     * Route: PATCH /friends/{friendship}/respond
     */
    public function respond(Request $request, Friendship $friendship): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:accepted,declined',
        ]);

        // Only receiver can respond
        if ($friendship->receiver_id !== $request->user()->id) {
            return back()->with('error', 'You are not authorized to respond to this request.');
        }

        $friendship->update([
            'status' => $request->input('status'),
        ]);

        $message = $request->input('status') === 'accepted'
            ? 'Friend request accepted!'
            : 'Friend request declined.';

        return redirect()->route('friends.index')->with('success', $message);
    }

    /**
     * Remove friend or cancel request.
     *
     * Route: DELETE /friends/{friendship}
     */
    public function destroy(Request $request, Friendship $friendship): RedirectResponse
    {
        $user = $request->user();

        // Only sender or receiver can delete
        if ($friendship->sender_id !== $user->id && $friendship->receiver_id !== $user->id) {
            return back()->with('error', 'You are not authorized to remove this friendship.');
        }

        $friendship->delete();

        return redirect()->route('friends.index')->with('success', 'Friend removed.');
    }
}
