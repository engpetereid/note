<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Validate date BEFORE parsing — prevents Carbon::parse() from accepting
        // arbitrary strings like "next year" or "1 week ago".
        $validated = $request->validate([
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $date = Carbon::createFromFormat('Y-m-d', $validated['date'] ?? now()->format('Y-m-d'));

        // Security / Business Rule: Cannot view future, cannot view older than 7 days
        if ($date->isFuture() || $date->diffInDays(now()) > 7) {
            return response()->json(['message' => 'Date out of allowed range.'], 403);
        }

        // 1. Get User's Customized Routine
        $routines = $user->routines()->get();

        // 2. Get Completed Logs for the requested date
        $completedLogIds = $user->trackingLogs()
            ->where('date', $date->format('Y-m-d'))
            ->where('status', true)
            ->pluck('activity_id');

        // 3. Get Smart Reading (cached inside model method)
        $reading = $user->getReadingForDate($date);

        // 4. Calculate Progress Stats
        $totalActivities = $routines->count();
        $completedCount  = $completedLogIds->count();
        $progressPercent = $totalActivities > 0
            ? round(($completedCount / $totalActivities) * 100)
            : 0;

        return response()->json([
            'current_date'       => $date->format('Y-m-d'),
            'reading'            => $reading,
            'routines'           => $routines,
            'completed_task_ids' => $completedLogIds,
            'user' => [
                'name' => Auth::user()->name,
            ],
            'stats' => [
                'progress'  => $progressPercent,
                'total'     => $totalActivities,
                'completed' => $completedCount,
            ],
            'settings' => [
                'reading_preference' => $user->reading_preference,
                'ot_year'            => $user->ot_year,
                'custom_start_date'  => $user->custom_start_date ? $user->custom_start_date->format('Y-m-d') : '',
            ],
        ]);
    }
}
