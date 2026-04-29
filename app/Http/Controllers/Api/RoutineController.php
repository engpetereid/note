<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutineController extends Controller
{
    /**
     * Fetch all available activities grouped by category (for the Onboarding screen).
     */
    public function index(): JsonResponse
    {
        $categories = Activity::orderBy('category')->get()->groupBy('category');

        return response()->json([
            'message'    => 'Activities fetched successfully.',
            'categories' => $categories,
        ]);
    }

    /**
     * Fetch the user's currently selected activity IDs.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'selected_activities' => $request->user()->routines()->pluck('activities.id')->values(),
        ]);
    }

    /**
     * Save or replace the user's customized spiritual routine.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_ids'   => 'required|array|min:1',          // min:1 prevents empty sync
            'activity_ids.*' => 'integer|exists:activities,id',
        ]);

        $user = $request->user();
        $user->routines()->sync($validated['activity_ids']);

        return response()->json([
            'message'             => 'Your spiritual routine has been successfully updated!',
            'selected_activities' => $user->routines()->pluck('activities.id')->values(),
        ]);
    }
}
