<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'phone_number',
        'password',
        'reading_preference',
        'signup_date',
        'fcm_token',
        'last_confession_date',
        'ot_year',
        'custom_start_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password'    => 'hashed',
        'signup_date' => 'date',
        'custom_start_date' => 'date',
        'last_confession_date' => 'date',
    ];

    /**
     * The spiritual activities the user has selected for their routine.
     */
    public function routines(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'user_routines');
    }

    /**
     * The history of their completed activities.
     */
    public function trackingLogs(): HasMany
    {
        return $this->hasMany(TrackingLog::class);
    }

    /**
     * Return the Bible reading passage for a given date.
     * Returns null if the reading cannot be determined.
     */
    public function getReadingForDate(\Carbon\Carbon $date): ?array
    {
        if ($this->reading_preference === 'fixed') {
            // تحويل السنة مؤقتاً لسنة كبيسة (مثل 2024) لضمان ثبات أرقام الأيام
            // هكذا سيكون 28 أبريل دائماً هو اليوم 119
            $dayNumber = $date->copy()->year(2024)->dayOfYear;
        } else {
            // الأولوية لتاريخ البدء المخصص، وإذا كان فارغاً نستخدم تاريخ التسجيل
            $startReference = $this->custom_start_date ?? $this->signup_date;

            // Guard: startReference may be null for legacy or seeded users.
            if (!$startReference) {
                return null;
            }

            // diffInDays(..., false) prevents absolute values, returning negative if $date is before $startReference
            $daysSinceStart = $startReference->startOfDay()->diffInDays($date->startOfDay(), false);

            if ($daysSinceStart < 0) {
                return null;
            }

            // تعديل باقي القسمة ليصبح 366 ليتوافق مع قاعدة بياناتك
            $dayNumber = ($daysSinceStart % 366) + 1;
        }

        $readingYear = $this->ot_year ?? 1;

        // Cache daily readings for 24 hours
        $reading = \Illuminate\Support\Facades\Cache::remember("daily_reading_arr_{$dayNumber}", 86400, function () use ($dayNumber) {
            $model = \App\Models\DailyReading::where('day_number', $dayNumber)->first();
            return $model ? $model->toArray() : null;
        });

        if (!$reading) {
            return null;
        }

        return [
            'day_number'  => $dayNumber,
            'year_cycle'  => $readingYear,
            'ot_passage'  => $readingYear == 1 ? $reading['ot_passage_year_1'] : $reading['ot_passage_year_2'],
            'nt_passage'  => $reading['nt_passage'],
            'explanation' => $reading['explanation'],
        ];
    }

    /**
     * Get the identifier used for password resets.
     * Overridden to use phone_number since the app has no email field.
     */
    public function getEmailForPasswordReset(): string
    {
        return $this->phone_number;
    }
}
