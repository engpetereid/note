<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            // الأجبية
            ['name_ar' => 'صلاة باكر', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة الساعة الثالثة', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة الساعة السادسة', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة الساعة التاسعة', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة الغروب', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة النوم', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],
            ['name_ar' => 'صلاة نص الليل', 'category' => 'agpeya', 'type' => 'daily', 'icon' => 'Flame'],

            // الكتاب المقدس
            ['name_ar' => 'قراءة العهد القديم', 'category' => 'bible', 'type' => 'daily', 'icon' => 'BookOpen'],
            ['name_ar' => 'قراءة العهد الجديد', 'category' => 'bible', 'type' => 'daily', 'icon' => 'BookOpen'],
            ['name_ar' => 'دراسة الكتاب المقدس', 'category' => 'bible', 'type' => 'daily', 'icon' => 'BookOpen'],

            // تدريبات روحية
            ['name_ar' => 'محاسبة النفس', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'صلاة يسوع', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'حفظ آيات', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'مشاركة الخلوة', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'مذبح عائلى', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'كتب روحية', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'صوم', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'ادارة الوقت', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'تدريب التلمذة', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],
            ['name_ar' => 'تدريب الشهر', 'category' => 'general', 'type' => 'daily', 'icon' => 'Activity'],

            // الكنيسة
            ['name_ar' => 'القداس', 'category' => 'church', 'type' => 'weekly', 'icon' => 'Church'],
            ['name_ar' => 'التسبحة', 'category' => 'church', 'type' => 'weekly', 'icon' => 'Church'],
            ['name_ar' => 'الاجتماعات', 'category' => 'church', 'type' => 'weekly', 'icon' => 'Church'],
            ['name_ar' => 'الافتقاد', 'category' => 'church', 'type' => 'weekly', 'icon' => 'Church'],
            ['name_ar' => 'خلوة اسبوعية', 'category' => 'church', 'type' => 'weekly', 'icon' => 'Church'],
        ];

        foreach ($activities as $activity) {
            Activity::create($activity);
        }
    }
}
