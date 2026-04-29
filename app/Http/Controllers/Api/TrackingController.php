<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrackingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackingController extends Controller
{
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|integer|exists:activities,id',
            'date'        => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $date = Carbon::createFromFormat('Y-m-d', $validated['date']);

        // Business Rule: Ensure date is within the editable 7-day window
        if ($date->isFuture() || $date->diffInDays(now()) > 7) {
            return response()->json(['message' => 'Cannot edit outside the 7-day archive window.'], 403);
        }

        // Ensure the activity is actually part of the user's routine
        if (!$user->routines()->where('activity_id', $validated['activity_id'])->exists()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Atomic toggle — lockForUpdate() prevents race conditions when two
        // simultaneous requests try to create the same log entry.
        $isCompleted = DB::transaction(function () use ($user, $validated, $date) {
            $log = TrackingLog::lockForUpdate()->where([
                'user_id'     => $user->id,
                'activity_id' => $validated['activity_id'],
                'date'        => $date->format('Y-m-d'),
            ])->first();

            if ($log) {
                $newStatus = !$log->status;
                $log->update(['status' => $newStatus]);
                return $newStatus;
            }

            TrackingLog::create([
                'user_id'     => $user->id,
                'activity_id' => $validated['activity_id'],
                'date'        => $date->format('Y-m-d'),
                'status'      => true,
            ]);

            return true;
        });

        return response()->json([
            'message'      => 'Activity updated successfully.',
            'is_completed' => $isCompleted,
        ]);
    }
}
