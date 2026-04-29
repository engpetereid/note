<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Carbon\Carbon;

class SendDailyReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:daily';

    /**
     * The console command description.
     */
    protected $description = 'Send push notifications to users who have pending daily routines.';

    /**
     * Execute the console command.
     */
    public function handle(Messaging $messaging)
    {
        // 1. Fetch users who have an FCM token and have set up a routine
        $users = User::whereNotNull('fcm_token')->with('routines')->get();
        $today = Carbon::today()->format('Y-m-d');
        $messagesSent = 0;

        foreach ($users as $user) {
            $totalRoutines = $user->routines->count();

            // Skip if they haven't built a system yet
            if ($totalRoutines === 0) continue;

            // 2. Check how many tasks they completed today
            $completedTasks = $user->trackingLogs()
                ->whereDate('date', $today)
                ->where('status', true)
                ->count();

            // 3. If they haven't finished everything, send a reminder
            if ($completedTasks < $totalRoutines) {

                $message = CloudMessage::withTarget('token', $user->fcm_token)
                    ->withNotification(Notification::create(
                        'تذكير روحي 🕊️', // Title: Spiritual Reminder
                        'لا تنسَ إكمال تدريباتك الروحية لليوم. المسيح معك!' // Body
                    ));

                try {
                    $messaging->send($message);
                    $messagesSent++;
                } catch (\Exception $e) {
                    // Log errors (e.g., if a token expired) but don't stop the loop
                    \Log::error("Failed to send Firebase notification to User ID {$user->id}: " . $e->getMessage());
                }
            }
        }

        $this->info("Successfully sent {$messagesSent} reminders.");
    }
}
