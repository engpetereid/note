import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle2,
    Circle,
    BookOpen,
    Church,
    Flame,
    ChevronRight,
    ChevronLeft,
    Calendar,
    Bell,
    Menu,
    Activity,
    PlusCircle,
    X,
    Settings2,
    LogOut,
    Edit3
} from 'lucide-react';
import axios from 'axios';

// Import our real API methods
import { fetchDashboardData, toggleActivity } from '../services/api';

export default function App() {
    // --- REAL STATE MANAGEMENT ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [routines, setRoutines] = useState([]);
    const [completedTaskIds, setCompletedTaskIds] = useState([]);
    const [reading, setReading] = useState(null);
    const [stats, setStats] = useState({ progress: 0, total: 0, completed: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // --- MENUS & SETTINGS STATE ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBellOpen, setIsBellOpen] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const [userSettings, setUserSettings] = useState({
        reading_preference: 'fixed',
        ot_year: 1,
        custom_start_date: ''
    });

    const [notifications] = useState([]);
    const [user, setUser] = useState(null);

    // --- AUDIO REFS ---
    const checkSoundRef = useRef(null);
    const uncheckSoundRef = useRef(null);
    const successSoundRef = useRef(null);

    useEffect(() => {

        checkSoundRef.current = new Audio('/sounds/check.mp3');

        uncheckSoundRef.current = new Audio('/sounds/uncheck.mp3');

        successSoundRef.current = new Audio('/sounds/success.mp3');
    }, []);

    const playSound = (type) => {
        try {
            if (type === 'check' && checkSoundRef.current) {
                checkSoundRef.current.currentTime = 0;
                checkSoundRef.current.play().catch(e => console.log('Audio play prevented', e));
            } else if (type === 'uncheck' && uncheckSoundRef.current) {
                uncheckSoundRef.current.currentTime = 0;
                uncheckSoundRef.current.play().catch(e => console.log('Audio play prevented', e));
            } else if (type === 'success' && successSoundRef.current) {
                successSoundRef.current.currentTime = 0;
                successSoundRef.current.play().catch(e => console.log('Audio play prevented', e));
            }
        } catch (error) {
            // Silently fail if browser blocks audio
        }
    };

    const formatDateStr = (dateObj) => {
        const offset = dateObj.getTimezoneOffset();
        const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const dateStr = formatDateStr(currentDate);

    // --- FETCH DATA FROM LARAVEL API ---
    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            try {
                const response = await fetchDashboardData(dateStr);
                setRoutines(response.data.routines || []);
                setCompletedTaskIds(response.data.completed_task_ids || []);
                setReading(response.data.reading || null);
                setStats(response.data.stats || { progress: 0, total: 0, completed: 0 });
                setUser(response.data.user || null);

                if (response.data.settings) {
                    setUserSettings({
                        reading_preference: response.data.settings.reading_preference || 'fixed',
                        ot_year: parseInt(response.data.settings.ot_year) || 1,
                        custom_start_date: response.data.settings.custom_start_date || ''
                    });
                }
            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [dateStr]);

    // --- LOGIC ---
    const handleToggleTask = async (taskId) => {
        const isCurrentlyCompleted = completedTaskIds.includes(taskId);

        // Play sound based on the new state
        playSound(isCurrentlyCompleted ? 'uncheck' : 'check');

        setCompletedTaskIds(prev =>
            isCurrentlyCompleted ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );

        setStats(prev => {
            const newCompleted = isCurrentlyCompleted ? prev.completed - 1 : prev.completed + 1;
            return {
                ...prev,
                completed: newCompleted,
                progress: prev.total > 0 ? Math.round((newCompleted / prev.total) * 100) : 0
            };
        });

        try {
            await toggleActivity(taskId, dateStr);
        } catch (error) {
            console.error("Toggle failed", error);
            setCompletedTaskIds(prev =>
                isCurrentlyCompleted ? [...prev, taskId] : prev.filter(id => id !== taskId)
            );
            setStats(prev => {
                const revertedCompleted = isCurrentlyCompleted ? prev.completed + 1 : prev.completed - 1;
                return {
                    ...prev,
                    completed: revertedCompleted,
                    progress: prev.total > 0 ? Math.round((revertedCompleted / prev.total) * 100) : 0
                };
            });
            alert('حدث خطأ. تأكد من اتصالك بالإنترنت ولا يمكنك تعديل مهام أقدم من 7 أيام.');
        }
    };

    const handleDateChange = (daysToAdd) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + daysToAdd);

        const today = new Date();

        // تهيئة التواريخ لمنتصف الليل لمقارنة الأيام بدقة بدون تداخل الساعات
        const date1 = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        const date2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (date1 > date2) return; // لا يمكن الذهاب للمستقبل

        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7 && date1 < date2) return; // الحد الأقصى للأرشيف هو 7 أيام

        setCurrentDate(newDate);
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            await axios.post('/api/profile/settings', userSettings, { withCredentials: true });
            playSound('success');
            setIsMenuOpen(false);
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("حدث خطأ أثناء حفظ الإعدادات.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    // --- UI CONFIGURATION ---
    const isToday = formatDateStr(currentDate) === formatDateStr(new Date());

    const groupedActivities = routines.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr);
        return acc;
    }, {});

    const CATEGORY_STYLES = {
        agpeya: {
            title: 'الأجبية',
            bg: 'bg-orange-50/50',
            border: 'border-orange-100',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            checkBg: 'bg-orange-50',
            checkColor: 'text-orange-500',
            fillColor: 'fill-orange-100'
        },
        bible: {
            title: 'الكتاب المقدس',
            bg: 'bg-blue-50/50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            checkBg: 'bg-blue-50',
            checkColor: 'text-blue-500',
            fillColor: 'fill-blue-100'
        },
        general: {
            title: 'تدريبات روحية',
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            checkBg: 'bg-emerald-50',
            checkColor: 'text-emerald-500',
            fillColor: 'fill-emerald-100'
        },
        church: {
            title: 'الكنيسة',
            bg: 'bg-purple-50/50',
            border: 'border-purple-100',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            checkBg: 'bg-purple-50',
            checkColor: 'text-purple-500',
            fillColor: 'fill-purple-100'
        },
        default: {
            title: 'أخرى',
            bg: 'bg-slate-50/50',
            border: 'border-slate-100',
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-600',
            checkBg: 'bg-slate-50',
            checkColor: 'text-slate-500',
            fillColor: 'fill-slate-100'
        }
    };

    const IconComponent = ({ name, className }) => {
        const icons = { Flame, BookOpen, Church, Activity };
        const Icon = icons[name] || Circle;
        return <Icon className={className} />;
    };

    if (isLoading) {
        return (
            <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-indigo-600">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-bold">جاري تحميل يومك الروحي...</span>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 overflow-x-hidden">

            {/* --- HEADER --- */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            م
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">
                                اهلا {user?.name || 'بك'}
                            </h1>
                            <p className="text-xs text-slate-500">رحلتك الروحية</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <a href={route('charts')} className="inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                            النمو
                        </a>
                        <button onClick={() => setIsBellOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors relative">
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 pb-24">

                {/* --- DATE NAVIGATION --- */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-6 border border-slate-100">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        aria-label="اليوم السابق"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <Calendar size={18} className="text-indigo-500" />
                        <span>
                            {isToday ? 'اليوم' : currentDate.toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <button
                        onClick={() => handleDateChange(1)}
                        disabled={isToday}
                        className={`p-2 rounded-full transition-all ${isToday ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        aria-label="اليوم التالي"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* --- PROGRESS VISUALIZATION --- */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-indigo-200 relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <h2 className="text-sm font-medium mb-1 opacity-90">إنجاز اليوم</h2>
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-4xl font-bold">{stats.progress}%</span>
                        <span className="text-sm opacity-80 mb-1">
                            {stats.completed} من {stats.total} مهام
                        </span>
                    </div>

                    <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-white h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${stats.progress}%` }}
                        >
                            {/* Shiny effect on progress bar */}
                            <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </section>

                {/* --- DAILY BIBLE READINGS --- */}
                {reading && (
                    <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-blue-500" />
                                <h2 className="text-lg font-bold text-slate-800">قراءات اليوم <span className="text-sm font-normal text-slate-400">(اليوم {reading.day_number})</span></h2>
                            </div>
                            <button onClick={() => setIsMenuOpen(true)} className="text-slate-400 hover:text-indigo-600 bg-slate-50 p-2 rounded-full transition-colors">
                                <Settings2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {reading.ot_passage && (
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                    <span className="text-xs font-bold text-blue-600 mb-1 block">العهد القديم (سنة {reading.year_cycle})</span>
                                    <p className="text-sm font-medium text-slate-700">{reading.ot_passage}</p>
                                </div>
                            )}
                            {reading.nt_passage && (
                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                    <span className="text-xs font-bold text-blue-600 mb-1 block">العهد الجديد</span>
                                    <p className="text-sm font-medium text-slate-700">{reading.nt_passage}</p>
                                </div>
                            )}
                            {reading.explanation && (
                                <div className="p-4 bg-slate-50 rounded-xl mt-4 border border-slate-100">
                                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                                        {reading.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* --- DAILY CHECKLIST OR FALLBACK --- */}
                {routines.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">لا يوجد نظام روحي بعد</h3>
                        <p className="text-sm text-slate-500 mb-6">يرجى الذهاب إلى صفحة بناء النظام لاختيار تدريباتك الروحية والبدء في المتابعة.</p>
                        <a href={route('onboarding')} className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors">
                            بناء نظامك الروحي
                        </a>
                    </div>
                ) : (
                    <section className="space-y-6">
                        {Object.entries(groupedActivities).map(([category, activities]) => {
                            const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

                            return (
                                <div key={category} className="space-y-3">
                                    <h3 className={`text-sm font-bold px-2 ${style.iconColor}`}>{style.title}</h3>

                                    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${style.border}`}>
                                        {activities.map((activity, index) => {
                                            const isCompleted = completedTaskIds.includes(activity.id);

                                            return (
                                                <div
                                                    key={activity.id}
                                                    onClick={() => handleToggleTask(activity.id)}
                                                    className={`
                                                        flex items-center p-4 cursor-pointer transition-all duration-300
                                                        ${index !== activities.length - 1 ? 'border-b border-slate-50' : ''}
                                                        ${isCompleted ? style.bg : 'hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <button
                                                        className={`ml-4 flex-shrink-0 transition-all duration-300 transform ${isCompleted ? `${style.checkColor} scale-110` : 'text-slate-300 hover:scale-110'}`}
                                                    >
                                                        {isCompleted ? <CheckCircle2 size={24} className={style.fillColor} /> : <Circle size={24} />}
                                                    </button>

                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className={`p-2 rounded-lg transition-colors duration-300 ${isCompleted ? style.iconBg + ' ' + style.iconColor : 'bg-slate-100 text-slate-500'}`}>
                                                            <IconComponent name={activity.icon} className="w-5 h-5" />
                                                        </div>
                                                        <span className={`font-medium transition-all duration-300 ${isCompleted ? 'text-slate-800 line-through decoration-slate-300 decoration-2 opacity-60' : 'text-slate-700'}`}>
                                                            {activity.name_ar}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        <footer className="pb-8 pt-2 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm">
                                <a
                                    href="https://www.linkedin.com/in/peter-eid-449a2620b/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Peter Eid
                                </a>
                                <span className="text-xs text-slate-400 font-medium">
                                    Crafted by
                                </span>
                            </div>
                        </footer>
                    </section>

                )}
            </main>

            {/* ========================================== */}
            {/* --- SLIDE-OVER MENU (SETTINGS) --- */}
            {/* ========================================== */}
            <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

                {/* Drawer */}
                <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-slate-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Settings2 className="text-indigo-600" size={20} />
                            الإعدادات
                        </h2>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">

                        {/* Routine Actions */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">النظام الروحي</h3>
                            <a href={route('onboarding')} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                        <Edit3 size={18} />
                                    </div>
                                    <span className="font-bold text-slate-700">تعديل التدريبات</span>
                                </div>
                                <ChevronLeft size={18} className="text-slate-300" />
                            </a>
                        </div>

                        {/* Bible Reading Preferences */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">إعدادات القراءات اليومية</h3>
                            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

                                {/* Start Date Type */}
                                <div className="p-4 border-b border-slate-50">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">بداية دورة القراءات</label>
                                    <select
                                        className="w-full bg-slate-50 border-transparent rounded-xl focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-slate-700"
                                        value={userSettings.reading_preference}
                                        onChange={(e) => setUserSettings({...userSettings, reading_preference: e.target.value})}
                                    >
                                        <option value="fixed">من بداية السنة (ثابت)</option>
                                        <option value="relative">مخصص (حسب تاريخ محدد)</option>
                                    </select>
                                </div>

                                {/* Custom Start Date Picker - ONLY visible if Relative */}
                                {userSettings.reading_preference === 'relative' && (
                                    <div className="p-4 border-b border-slate-50 bg-indigo-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-bold text-indigo-900 mb-2">تاريخ البدء المخصص</label>
                                        <input
                                            type="date"
                                            value={userSettings.custom_start_date}
                                            onChange={(e) => setUserSettings({...userSettings, custom_start_date: e.target.value})}
                                            className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            سيبدأ حساب اليوم الأول للقراءات من هذا التاريخ.
                                        </p>
                                    </div>
                                )}

                                {/* OT Year */}
                                <div className="p-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">سنة العهد القديم</label>
                                    <div className="flex bg-slate-50 p-1 rounded-xl">
                                        <button
                                            onClick={() => setUserSettings({...userSettings, ot_year: 1})}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${userSettings.ot_year === 1 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            السنة الأولى
                                        </button>
                                        <button
                                            onClick={() => setUserSettings({...userSettings, ot_year: 2})}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${userSettings.ot_year === 2 ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            السنة الثانية
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={isSavingSettings}
                                className="mt-4 w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                            >
                                {isSavingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    </div>

                    <div className="p-5 border-t border-slate-200 bg-white">
                        <form method="POST" action={route('logout')}>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors">
                                <LogOut size={18} />
                                <span>تسجيل الخروج</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* --- SLIDE-OVER NOTIFICATIONS (BELL) --- */}
            {/* ========================================== */}
            <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isBellOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBellOpen(false)}></div>

                {/* Drawer (Slide from Bottom on Mobile, Right on Desktop) */}
                <div className={`absolute bottom-0 sm:top-0 right-0 w-full sm:w-96 sm:h-full h-[80vh] bg-slate-50 shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none transform transition-transform duration-300 ease-out ${isBellOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'}`}>
                    <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center rounded-t-3xl sm:rounded-none">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Bell className="text-indigo-600" size={20} />
                            الإشعارات
                        </h2>
                        <button onClick={() => setIsBellOpen(false)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notifications.length === 0 ? (
                            <div className="text-center text-slate-500 py-10">لا توجد إشعارات حالياً</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-4 rounded-2xl border ${notif.unread ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-70'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${notif.unread ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {notif.title}
                                            {notif.unread && <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>}
                                        </h4>
                                        <span className="text-xs text-slate-400">{notif.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{notif.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Optional global css injection for shimmer effect */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}
