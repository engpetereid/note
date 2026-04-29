<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'range' => 'nullable|in:1M,3M,6M,1Y',
        ]);

        $user  = $request->user();
        $range = $validated['range'] ?? '1M';
        $now   = now();

        // اشتقاق تاريخ البداية، طريقة التجميع، وعدد الفترات بناءً على النطاق الزمني
        [$startDate, $groupBy, $periodsToIterate] = match ($range) {
            '3M'    => [$now->copy()->subWeeks(11)->startOfWeek(), 'week', 12],
            '6M'    => [$now->copy()->startOfMonth()->subMonths(5), 'month', 6],
            '1Y'    => [$now->copy()->startOfMonth()->subMonths(11), 'month', 12],
            default => [$now->copy()->subDays(29),  'day',   30],
        };

        // Fetch all relevant logs in a single query, then filter in-memory per activity
        $logs       = $user->trackingLogs()
            ->where('date', '>=', $startDate->format('Y-m-d'))
            ->where('status', true)
            ->get();

        $activities = $user->routines()->get();

        $chartsData = $activities->map(function ($activity) use ($logs, $startDate, $now, $groupBy, $periodsToIterate) {
            $activityLogs = $logs->where('activity_id', $activity->id);
            $dataPoints   = [];
            $sumValues    = 0;

            if ($groupBy === 'day') {
                // تجميع يومي لمدة شهر (30 يوم)
                for ($i = 0; $i < $periodsToIterate; $i++) {
                    $day     = $startDate->copy()->addDays($i);
                    $dateStr = $day->format('Y-m-d');

                    // استخدام contains مع تحويل التاريخ لنص لحل مشكلة عدم التطابق (Object vs String)
                    $isDone = $activityLogs->contains(function ($log) use ($dateStr) {
                        return Carbon::parse($log->date)->format('Y-m-d') === $dateStr;
                    });

                    $percentage   = $isDone ? 100 : 0;
                    $dataPoints[] = ['label' => $day->format('d/m'), 'value' => $percentage];
                    $sumValues   += $percentage;
                }
            } elseif ($groupBy === 'week') {
                // تجميع أسبوعي لفلتر الـ 3 أشهر (12 أسبوع)
                for ($i = 0; $i < $periodsToIterate; $i++) {
                    $weekStart = $startDate->copy()->addWeeks($i);
                    $weekEnd   = $weekStart->copy()->endOfWeek()->min($now);

                    $startStr = $weekStart->format('Y-m-d');
                    $endStr   = $weekEnd->format('Y-m-d');

                    $daysInPeriod = $weekStart->diffInDays($weekEnd) + 1;

                    // استخدام filter بدلاً من whereBetween لضمان المطابقة الدقيقة
                    $completed = $activityLogs->filter(function ($log) use ($startStr, $endStr) {
                        $logDate = Carbon::parse($log->date)->format('Y-m-d');
                        return $logDate >= $startStr && $logDate <= $endStr;
                    })->count();

                    $percentage   = $daysInPeriod > 0 ? round(($completed / $daysInPeriod) * 100) : 0;
                    $dataPoints[] = ['label' => $weekStart->format('d/m'), 'value' => $percentage];
                    $sumValues   += $percentage;
                }
            } else {
                // تجميع شهري لفلتر 6 أشهر والسنة
                for ($i = 0; $i < $periodsToIterate; $i++) {
                    $monthStart = $startDate->copy()->addMonths($i)->startOfMonth();
                    // Cap month end at today to avoid including future days in the %
                    $monthEnd   = $monthStart->copy()->endOfMonth()->min($now);

                    $startStr = $monthStart->format('Y-m-d');
                    $endStr   = $monthEnd->format('Y-m-d');

                    $daysInPeriod = $monthStart->diffInDays($monthEnd) + 1;

                    // استخدام filter لضمان المطابقة الدقيقة
                    $completed = $activityLogs->filter(function ($log) use ($startStr, $endStr) {
                        $logDate = Carbon::parse($log->date)->format('Y-m-d');
                        return $logDate >= $startStr && $logDate <= $endStr;
                    })->count();

                    $percentage   = $daysInPeriod > 0 ? round(($completed / $daysInPeriod) * 100) : 0;
                    $dataPoints[] = ['label' => $monthStart->translatedFormat('M'), 'value' => $percentage];
                    $sumValues   += $percentage;
                }
            }

            return [
                'id'         => $activity->id,
                'name_ar'    => $activity->name_ar,
                'icon'       => $activity->icon,
                'average'    => $periodsToIterate > 0 ? round($sumValues / $periodsToIterate) : 0,
                'dataPoints' => $dataPoints,
            ];
        });

        return response()->json([
            'charts'               => $chartsData,
            'last_confession_date' => $user->last_confession_date,
        ]);
    }

    /**
     * Update the user's last confession date.
     * Enforces date is not in the future.
     */
    public function updateConfession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d|before_or_equal:today',
        ]);

        $request->user()->update(['last_confession_date' => $validated['date']]);

        return response()->json(['message' => 'تم تحديث تاريخ الاعتراف بنجاح']);
    }
}
