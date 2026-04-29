import React, { useState, useEffect } from 'react';
import {
    Flame,
    BookOpen,
    Activity,
    Church,
    CheckCircle2,
    Circle,
    Save,
    ChevronRight,
    Sparkles
} from 'lucide-react';

// استيراد دوال الـ API الصحيحة الخاصة بصفحة بناء النظام
import { fetchAllActivities, fetchMyRoutine, saveMyRoutine, initCsrf } from '../services/api';

const CATEGORY_TITLES = {
    agpeya: 'صلوات الأجبية (يومي)',
    bible: 'الكتاب المقدس (يومي)',
    general: 'تدريبات روحية أخرى',
    church: 'الكنيسة والخدمة'
};

const CATEGORY_DESCRIPTIONS = {
    agpeya: 'اختر الصلوات التي تتناسب مع قانونك الروحي الحالي.',
    bible: 'حدد القراءات التي تلتزم بها.',
    general: 'اختر التدريبات التي اتفقْتَ عليها مع أب اعترافك.',
    church: 'أنشطتك والتزاماتك الكنسية.'
};

export default function Onboarding() {
    // --- REAL STATE MANAGEMENT ---
    const [categories, setCategories] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // جلب البيانات الحقيقية من الخادم عند تحميل الصفحة
    useEffect(() => {
        const loadData = async () => {
            try {
                // Initialize Sanctum CSRF protection before making any API calls
                await initCsrf();

                // جلب جميع الأنشطة المتاحة والنظام الحالي للمستخدم في نفس الوقت
                const [activitiesRes, routineRes] = await Promise.all([
                    fetchAllActivities(),
                    fetchMyRoutine()
                ]);

                setCategories(activitiesRes.data.categories || {});
                setSelectedIds(routineRes.data.selected_activities || []);
            } catch (error) {
                console.error("Failed to load onboarding data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleToggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // إرسال البيانات الحقيقية للخادم لحفظها
            await saveMyRoutine(selectedIds);
            alert('تم حفظ نظامك الروحي بنجاح! سيتم توجيهك الآن إلى لوحة المتابعة.');

            // إعادة التوجيه إلى صفحة المتابعة بعد الحفظ
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Failed to save routine", error);
            alert('حدث خطأ أثناء الحفظ. تأكد من اتصالك بالإنترنت.');
        } finally {
            setIsSaving(false);
        }
    };

    // Icon matcher component
    const IconComponent = ({ name, className }) => {
        const icons = { Flame, BookOpen, Church, Activity };
        const Icon = icons[name] || Circle;
        return <Icon className={className} />;
    };

    // --- RENDER LOADING STATE ---
    if (isLoading) {
        return (
            <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-indigo-600">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-bold">جاري تحميل التدريبات الروحية...</span>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 selection:bg-indigo-100">

            {/* --- HEADER --- */}
            <header className="bg-white px-4 py-5 shadow-sm sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-full"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">بناء نظامك الروحي</h1>
                        <p className="text-xs text-slate-500 mt-1">اختر التدريبات التي تناسب قانونك الروحي</p>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 mt-6">

                {/* Welcome / Info Card */}
                <div className="bg-indigo-600 rounded-2xl p-5 text-white mb-8 shadow-lg shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mt-10"></div>
                    <Sparkles className="text-indigo-200 mb-3" size={28} />
                    <h2 className="text-lg font-bold mb-2 relative z-10">رحلتك تبدأ من هنا</h2>
                    <p className="text-sm text-indigo-100 leading-relaxed relative z-10">
                        لقياس نموك الروحي. اختر الى يناسبك دلوقتى، وممكن تعديله في أي وقت بعد كده.
                    </p>
                </div>

                {/* Categories Iteration (Real Data) */}
                <div className="space-y-8">
                    {Object.entries(categories).map(([categoryKey, activities]) => (
                        <section key={categoryKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-3 px-1">
                                <h3 className="text-lg font-bold text-slate-800">
                                    {CATEGORY_TITLES[categoryKey] || 'أخرى'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {CATEGORY_DESCRIPTIONS[categoryKey] || 'تدريبات إضافية'}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                {activities.map((activity, index) => {
                                    const isSelected = selectedIds.includes(activity.id);
                                    return (
                                        <div
                                            key={activity.id}
                                            onClick={() => handleToggle(activity.id)}
                                            className={`
                                                flex items-center p-4 cursor-pointer transition-all duration-200
                                                ${index !== activities.length - 1 ? 'border-b border-slate-100' : ''}
                                                ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                                            `}
                                        >
                                            <button
                                                className={`ml-4 flex-shrink-0 transition-transform duration-300 ${isSelected ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
                                            >
                                                {isSelected ? <CheckCircle2 size={24} className="fill-indigo-100" /> : <Circle size={24} />}
                                            </button>

                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`p-2 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    <IconComponent name={activity.icon} className="w-5 h-5" />
                                                </div>
                                                <span className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-indigo-950' : 'text-slate-600'}`}>
                                                    {activity.name_ar}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            {/* --- FLOATING SAVE BUTTON --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-6 z-30">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={selectedIds.length === 0 || isSaving}
                        className={`
                            w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300
                            ${selectedIds.length === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1'
                        }
                        `}
                    >
                        {isSaving ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={22} />
                                <span>حفظ وبدء المتابعة ({selectedIds.length})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
