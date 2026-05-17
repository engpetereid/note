import React, { useState, useEffect } from 'react';
import { ChevronRight, BarChart3, Flame, BookOpen, Church, Activity, TrendingUp, AlertTriangle, Calendar, Settings2 } from 'lucide-react';
import axios from 'axios';
import { Head, Link } from '@inertiajs/react';

// --- Icon Matcher ---
const IconComponent = ({ name, className }) => {
    const icons = { Flame, BookOpen, Church, Activity };
    const Icon = icons[name] || Activity;
    return <Icon className={className} />;
};

export default function Charts() {
    const [timeRange, setTimeRange] = useState('1M'); // '1M', '3M', '6M', '1Y'
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Confession State ---
    const [lastConfessionDate, setLastConfessionDate] = useState(null);
    const [showConfessionPicker, setShowConfessionPicker] = useState(false);
    const [newConfessionDate, setNewConfessionDate] = useState('');

    // --- Fetch Data ---
    useEffect(() => {
        const fetchCharts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/charts?range=${timeRange}`, {
                    withCredentials: true
                });
                setChartData(response.data.charts || []);
                if (response.data.last_confession_date) {
                    setLastConfessionDate(response.data.last_confession_date);
                }
            } catch (error) {
                console.error("Failed to fetch charts data", error);
                // Fallback to mock data for preview
                setChartData(generateMockData(timeRange));
                setLastConfessionDate('2024-01-01'); // Force mock alert
            } finally {
                setIsLoading(false);
            }
        };

        fetchCharts();
    }, [timeRange]);

    // --- Confession Logic ---
    const checkConfessionAlert = (dateStr) => {
        if (!dateStr || dateStr === '0001-00-00') return true;
        const lastDate = new Date(dateStr);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 45; // تنبيه إذا تجاوز شهر ونصف
    };

    const needsConfession = checkConfessionAlert(lastConfessionDate);

    const handleUpdateConfession = async () => {
        if (!newConfessionDate) return;

        setLastConfessionDate(newConfessionDate);
        setShowConfessionPicker(false);
        setNewConfessionDate('');

        try {
            await axios.post('/api/profile/confession', { date: newConfessionDate }, { withCredentials: true });
        } catch (error) {
            console.error("Failed to update confession date", error);
        }
    };

    // --- Custom Smooth SVG Line Chart Component ---
    const CustomLineChart = ({ dataPoints }) => {
        if (!dataPoints || dataPoints.length === 0) return null;

        const viewBoxWidth = 1000;
        const viewBoxHeight = 120;

        // إعطاء حافة (Padding) للحفاظ على النقاط العلوية والسفلية مرئية بوضوح
        const paddingY = 20;
        const drawableHeight = viewBoxHeight - (paddingY * 2);

        const xStep = dataPoints.length > 1 ? viewBoxWidth / (dataPoints.length - 1) : viewBoxWidth;

        // Calculate SVG coordinates
        const points = dataPoints.map((p, i) => {
            const x = i * xStep;
            // يتم عكس المحور الصادي لأن SVG يبدأ من الأعلى
            const y = (viewBoxHeight - paddingY) - (p.value > 0 ? (p.value / 100) * drawableHeight : 0);
            return { x, y, value: p.value, label: p.label };
        });

        // 🌟 خوارزمية رسم منحنى سلس (Cubic Bezier Curve) بدلاً من الخطوط الحادة 🌟
        const generateSmoothPath = (pts) => {
            if (pts.length === 0) return '';
            let path = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
                const curr = pts[i];
                const next = pts[i + 1];
                // الشد الأفقي لجعل المنحنى ناعماً ولا يتجاوز النقاط (Monotonic)
                const tensionX = (next.x - curr.x) / 2.5;
                path += ` C ${curr.x + tensionX} ${curr.y} ${next.x - tensionX} ${next.y} ${next.x} ${next.y}`;
            }
            return path;
        };

        const linePath = generateSmoothPath(points);
        // إغلاق المسار للأسفل لإنشاء خلفية التدرج اللوني
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${viewBoxHeight} L ${points[0].x} ${viewBoxHeight} Z`;

        // Render limited X-Axis labels to prevent mobile clutter
        const renderXLabels = () => {
            if (dataPoints.length <= 6) {
                return dataPoints.map((p, i) => <span key={i} className="text-center">{p.label}</span>);
            }
            const step = Math.floor(dataPoints.length / 4);
            const indexesToShow = [0, step, step * 2, step * 3, dataPoints.length - 1];
            return (
                <div className="flex justify-between w-full px-1">
                    {indexesToShow.map(idx => (
                        <span key={idx} className="text-center w-10 truncate">{dataPoints[idx]?.label}</span>
                    ))}
                </div>
            );
        };

        return (
            <div className="mt-6 relative">
                <style>
                    {`
                        @keyframes drawLine {
                            from { stroke-dasharray: 4000; stroke-dashoffset: 4000; }
                            to { stroke-dasharray: 4000; stroke-dashoffset: 0; }
                        }
                        .animate-draw-line { animation: drawLine 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                        @keyframes fadeArea {
                            from { opacity: 0; transform: translateY(5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-area { animation: fadeArea 1.5s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
                        @keyframes popIn {
                            from { transform: scale(0); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: center; transform-box: fill-box; opacity: 0; }
                    `}
                </style>
                <div className="relative h-32 w-full">
                    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* 🌟 Gradients & Filters 🌟 */}
                        <defs>
                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1={paddingY} x2={viewBoxWidth} y2={paddingY} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6,6" />
                        <line x1="0" y1={viewBoxHeight/2} x2={viewBoxWidth} y2={viewBoxHeight/2} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6,6" />
                        <line x1="0" y1={viewBoxHeight-paddingY} x2={viewBoxWidth} y2={viewBoxHeight-paddingY} stroke="#e2e8f0" strokeWidth="2" />

                        {/* Chart Shape with Animation */}
                        <path d={areaPath} fill="url(#colorArea)" className="animate-fade-area" />
                        <path
                            d={linePath}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-draw-line"
                            filter="url(#glow)"
                        />

                        {/* Data Points (Dots) */}
                        {points.map((p, idx) => (
                            <circle
                                key={idx}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                className="fill-white stroke-indigo-500 stroke-[3px] hover:r-6 hover:stroke-purple-500 transition-all cursor-pointer animate-pop-in cursor-crosshair"
                                style={{ animationDelay: `${(idx * 0.05) + 0.5}s` }}
                            >
                                <title>{`${p.label}: ${p.value}%`}</title>
                            </circle>
                        ))}
                    </svg>
                </div>

                {/* X-Axis */}
                <div className="flex justify-between mt-4 text-[11px] text-slate-400 font-semibold">
                    {renderXLabels()}
                </div>
            </div>
        );
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-24 selection:bg-indigo-100">
            <Head title="الإحصائيات | النظام الروحي" />

            {/* --- HEADER --- */}
            <header className="bg-white/80 backdrop-blur-md px-4 py-5 shadow-sm sticky top-0 z-20 border-b border-slate-100">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 rounded-full"
                        >
                            <ChevronRight size={24} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">
                                معدل النمو
                            </h1>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 tracking-wide">تتبع مسارك الروحي بوضوح</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                        <TrendingUp size={20} className="text-indigo-500" />
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 mt-6 space-y-6">

                {/* --- CONFESSION WIDGET --- */}
                {needsConfession ? (
                    <div className="rounded-[1.5rem] p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 shadow-lg shadow-orange-100/50 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
                            <AlertTriangle size={100} className="text-orange-500" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-3.5">
                                <div className="p-3.5 rounded-2xl bg-white shadow-sm text-orange-500">
                                    <AlertTriangle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-orange-900 text-base">الاعتراف متأخر!</h3>
                                    <p className="text-xs mt-1 text-orange-700 font-medium leading-relaxed max-w-[200px]">
                                        لقد مر أكثر من شهر ونصف على آخر اعتراف لك.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfessionPicker(!showConfessionPicker)}
                            className="mt-5 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-200 transition-all active:scale-[0.98]"
                        >
                            {showConfessionPicker ? 'إلغاء' : 'تحديث تاريخ الاعتراف'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                                <Church size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-800"> الاعتراف</h3>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                    آخر اعتراف: {lastConfessionDate ? new Date(lastConfessionDate).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'غير مسجل'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfessionPicker(!showConfessionPicker)}
                            className="text-indigo-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            <Settings2 size={20} />
                        </button>
                    </div>
                )}

                {/* Confession Date Picker */}
                {showConfessionPicker && (
                    <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <input
                            type="date"
                            value={newConfessionDate}
                            onChange={(e) => setNewConfessionDate(e.target.value)}
                            className="flex-1 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                        />
                        <button
                            onClick={handleUpdateConfession}
                            disabled={!newConfessionDate}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-95"
                        >
                            حفظ التاريخ
                        </button>
                    </div>
                )}

                {/* --- TIME RANGE TOGGLE (PILL DESIGN) --- */}
                <div className="bg-slate-200/60 p-1.5 rounded-full flex relative overflow-hidden backdrop-blur-sm">
                    {[
                        { id: '1M', label: 'شهر' },
                        { id: '3M', label: '3 أشهر' },
                        { id: '6M', label: '6 أشهر' },
                        { id: '1Y', label: 'سنة' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id)}
                            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all duration-300 relative z-10 ${
                                timeRange === tab.id
                                    ? 'text-slate-800 shadow-sm bg-white'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- CHARTS LIST --- */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-indigo-500">
                        <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-bold text-sm">تحليل البيانات...</span>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm border border-slate-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-700 mb-2">لا توجد بيانات كافية</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-[250px] leading-relaxed">
                            قم بمتابعة تدريباتك اليومية لتظهر الرسوم البيانية الخاصة بنموك.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {chartData.map((activityChart, index) => (
                            <section
                                key={activityChart.id}
                                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
                                        <IconComponent name={activityChart.icon} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-slate-800 text-base">{activityChart.name_ar}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-xs font-semibold text-slate-400">متوسط الإنجاز:</span>
                                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                                                {activityChart.average}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <CustomLineChart dataPoints={activityChart.dataPoints} />
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Helper for Fallback ---
function generateMockData(range) {
    const activities = [
        { id: 1, name_ar: 'صلاة باكر', icon: 'Flame' },
        { id: 8, name_ar: 'قراءة الكتاب المقدس', icon: 'BookOpen' },
        { id: 18, name_ar: 'القداس', icon: 'Church' }
    ];

    let labels = [];
    if (range === '1M') {
        for(let i=1; i<=30; i++) labels.push(`${i}`);
    }
    else if (range === '3M') {
        for(let i=1; i<=12; i++) labels.push(`أسبوع ${i}`);
    }
    else if (range === '6M') labels = ['ش 1', 'ش 2', 'ش 3', 'ش 4', 'ش 5', 'ش 6'];
    else if (range === '1Y') labels = ['يناير', 'مارس', 'مايو', 'يوليو', 'سبتمبر', 'نوفمبر'];

    return activities.map(act => {
        const points = labels.map(label => {
            const val = range === '1M' ? (Math.random() > 0.4 ? 100 : 0) : Math.floor(Math.random() * 60) + 40;
            return { label: label, value: val };
        });

        const avg = Math.round(points.reduce((acc, curr) => acc + curr.value, 0) / points.length);

        return { ...act, average: avg, dataPoints: points };
    });
}
