<?php

use App\Http\Controllers\Api\ChartController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\TrackingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    // Dashboard — returns today's (or a past day's) data
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Toggle is rate-limited (60 requests/min) to prevent scripted habit abuse
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/tracking/toggle', [TrackingController::class, 'toggle']);
    });

    // Activity catalogue & user routine management
    Route::get('/activities', [RoutineController::class, 'index']);
    Route::get('/routines',   [RoutineController::class, 'show']);
    Route::post('/routines',  [RoutineController::class, 'store']);

    // Chart data aggregation
    Route::get('/charts', [ChartController::class, 'index']);

    // Profile management
    Route::post('/profile/confession', [ChartController::class, 'updateConfession']);
    Route::post('/profile/fcm-token',  [ProfileController::class, 'updateFcmToken']);
    Route::post('/profile/settings',   [ProfileController::class, 'updateSettings']);
});
