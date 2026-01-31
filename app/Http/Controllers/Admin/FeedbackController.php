<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ======================================================================================
 * ADMIN FEEDBACK CONTROLLER
 * ======================================================================================
 *
 * Controller untuk admin melihat dan mengelola semua feedback dari user.
 *
 * ======================================================================================
 */
class FeedbackController extends Controller
{
    /**
     * Display a listing of all feedbacks.
     */
    public function index(Request $request): Response
    {
        $query = Feedback::with('user')->latest();

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search in subject or message
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Per page (default 20)
        $perPage = in_array($request->input('per_page'), [10, 20, 50, 100])
            ? (int) $request->input('per_page')
            : 20;

        $feedbacks = $query->paginate($perPage)->withQueryString();

        // Get users for filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Feedbacks/Index', [
            'feedbacks' => $feedbacks,
            'users' => $users,
            'filters' => $request->only(['type', 'status', 'user_id', 'search', 'per_page']),
        ]);
    }

    /**
     * Display single feedback.
     */
    public function show(Feedback $feedback): Response
    {
        $feedback->load('user');

        return Inertia::render('Admin/Feedbacks/Show', [
            'feedback' => $feedback,
        ]);
    }

    /**
     * Update feedback status.
     */
    public function updateStatus(Request $request, Feedback $feedback): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,read,resolved,closed'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $feedback->update($validated);

        return back()->with('status', 'Status feedback berhasil diperbarui.');
    }
}
