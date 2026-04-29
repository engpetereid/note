<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Update the user's Firebase Cloud Messaging token.
     */
    public function updateFcmToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string|max:255',
        ]);

        $request->user()->update(['fcm_token' => $validated['fcm_token']]);

        return response()->json(['message' => 'Token updated successfully']);
    }

    /**
     * Update the user's reading preference settings.
     */

    public function updateSettings(Request $request)
    {
        $request->validate([
            'reading_preference' => 'required|in:fixed,relative',
            'ot_year' => 'required|integer|in:1,2',
            'custom_start_date' => 'nullable|date_format:Y-m-d',
        ]);

        $request->user()->update([
            'reading_preference' => $request->reading_preference,
            'ot_year' => $request->ot_year,
            'custom_start_date' => $request->custom_start_date,
        ]);

        return response()->json(['message' => 'تم حفظ الإعدادات بنجاح']);
    }

}
