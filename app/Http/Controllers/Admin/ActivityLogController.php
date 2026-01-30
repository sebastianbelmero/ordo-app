<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

/**
 * ======================================================================================
 * ACTIVITY LOG CONTROLLER
 * ======================================================================================
 *
 * Controller untuk admin melihat semua activity logs.
 *
 * ======================================================================================
 */
class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request): Response
    {
        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // Filter by log_name
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by causer (user)
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id)
                ->where('causer_type', 'App\Models\User');
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Per page (default 20)
        $perPage = in_array($request->input('per_page'), [10, 20, 50, 100]) 
            ? (int) $request->input('per_page') 
            : 20;

        $activities = $query->paginate($perPage)->withQueryString();

        // Get unique log names for filter
        $logNames = Activity::distinct()->pluck('log_name')->filter()->values();

        // Get all users for filter
        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'activities' => $activities,
            'logNames' => $logNames,
            'users' => $users,
            'filters' => $request->only(['log_name', 'causer_id', 'from_date', 'to_date', 'search', 'per_page']),
        ]);
    }

    /**
     * Display single activity log.
     */
    public function show(Activity $activity): Response
    {
        $activity->load(['causer', 'subject']);

        return Inertia::render('Admin/ActivityLogs/Show', [
            'activity' => $activity,
        ]);
    }
}
