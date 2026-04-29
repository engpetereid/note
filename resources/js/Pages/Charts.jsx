import React, { useState, useEffect } from 'react';
import { ChevronRight, BarChart3, Flame, BookOpen, Church, Activity, TrendingUp, AlertTriangle, Calendar, Settings2 } from 'lucide-react';
import axios from 'axios';

// --- Mocks for Canvas Preview ---
const Head = ({ title }) => {
    useEffect(() => { document.title = title; }, [title]);
    return null;
};
const Link = ({ href, children, className }) => (
    <a href={href} className={className}>{children}</a>
);

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

        // Optimistic Update
        setLastConfessionDate(newConfessionDate);
        setShowConfessionPicker(false);
        setNewConfessionDate('');

        try {
            await axios.post('/api/profile/confession', { date: newConfessionDate }, { withCredentials: true });
        } catch (error) {
            console.error("Failed to update confession date", error);
        }
    };

    // --- Custom SVG Line Chart Component ---
    const CustomLineChart = ({ dataPoints }) => {
        if (!dataPoints || dataPoints.length === 0) return null;

        const viewBoxWidth = 1000;
        const viewBoxHeight = 100;

        // إعطاء حافة (Padding) من الأسفل والأعلى حتى لا تختفي النقاط عند قيمة صفر
        const paddingY = 15;
        const drawableHeight = viewBoxHeight - (paddingY * 2);

        const xStep = dataPoints.length > 1 ? viewBoxWidth / (dataPoints.length - 1) : viewBoxWidth;

        // Calculate SVG coordinates
        const points = dataPoints.map((p, i) => {
            const x = i * xStep;
            // يتم عكس المحور الصادي لأن SVG يبدأ من الأعلى
            const y = (viewBoxHeight - paddingY) - (p.value > 0 ? (p.value / 100) * drawableHeight : 0);
            return { x, y, value: p.value, label: p.label };
        });

        // Generate Paths for Line and Gradient Area
        const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        // التوجيه للأسفل لإنشاء خلفية شفافة حتى إطار الرؤية (viewBoxHeight)
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${viewBoxHeight} L ${points[0].x} ${viewBoxHeight} Z`;

        // Render limited X-Axis labels to prevent mobile clutter
        const renderXLabels = () => {
            if (dataPoints.length <= 6) {
                return dataPoints.map((p, i) => <span key={i} className="text-center">{p.label}</span>);
            }
            // If many points (like 30 days), show evenly spaced labels
            const step = Math.floor(dataPoints.length / 4);
            const indexesToShow = [0, step, step * 2, step * 3, dataPoints.length - 1];
            return (
                <div className="flex justify-between w-full">
                    {indexesToShow.map(idx => (
                        <span key={idx} className="text-center">{dataPoints[idx]?.label}</span>
                    ))}
                </div>
            );
        };

        return (
            <div className="mt-4">
                <style>
                    {`
                        @keyframes drawLine {
                        from { stroke-dasharray: 3000; stroke-dashoffset: 3000; }
                        to { stroke-dasharray: 3000; stroke-dashoffset: 0; }
                        }
                        .animate-draw-line { animation: drawLine 1.5s ease-out forwards; }
                        @keyframes fadeArea {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-area { animation: fadeArea 1.5s ease-out forwards; }
                    `}
                </style>
                <div className="relative h-28 w-full border-b border-slate-200">
                    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* Gradient */}
                        <defs>
                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="25" x2="1000" y2="25" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="0" y1="75" x2="1000" y2="75" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="5,5" />

                        {/* Chart Shape with Animation */}
                        <path d={areaPath} fill="url(#colorArea)" className="animate-fade-area" />
                        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />

                        {/* Data Points (Dots) */}
                        {points.map((p, idx) => (
                            <circle
                                key={idx}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                className="fill-white stroke-indigo-600 stroke-2 hover:r-8 transition-all cursor-pointer animate-fade-area"
                            >
                                <title>{`${p.label}: ${p.value}%`}</title>
                            </circle>
                        ))}
                    </svg>
                </div>

                {/* X-Axis */}
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium px-1">
                    {renderXLabels()}
                </div>
            </div>
        );
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 selection:bg-indigo-100">
            <Head title="الإحصائيات | النظام الروحي" />

            {/* --- HEADER --- */}
            <header className="bg-white px-4 py-5 shadow-sm sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-full"
                        >
                            <ChevronRight size={24} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">معدل النمو</h1>
                            <p className="text-xs text-slate-500 mt-1">تتبع مسارك الروحي</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <TrendingUp size={20} />
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 mt-6">

                {/* --- CONFESSION WIDGET (DYNAMIC LOGIC) --- */}
                {needsConfession ? (
                    /* Big Alert if confession is needed */
                    <div className="mb-6 rounded-3xl p-5 bg-orange-50 border border-orange-200 shadow-sm animate-in fade-in zoom-in duration-500">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-orange-100 text-orange-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-orange-700">الاعتراف متأخر!</h3>
                                    <p className="text-sm mt-0.5 text-orange-500 font-medium leading-tight">
                                        لقد مر أكثر من شهر ونصف على آخر اعتراف لك.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfessionPicker(!showConfessionPicker)}
                            className="mt-4 w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            {showConfessionPicker ? 'إلغاء' : 'تحديث تاريخ الاعتراف'}
                        </button>
                    </div>
                ) : (
                    /* Subtle Header if confession is up to date */
                    <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Church size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">الاعتراف</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    آخر اعتراف: {lastConfessionDate ? new Date(lastConfessionDate).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }) : 'غير مسجل'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfessionPicker(!showConfessionPicker)}
                            className="text-xs font-bold text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>
                )}

                {/* Confession Date Picker (Shared) */}
                {showConfessionPicker && (
                    <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <input
                            type="date"
                            value={newConfessionDate}
                            onChange={(e) => setNewConfessionDate(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                        />
                        <button
                            onClick={handleUpdateConfession}
                            disabled={!newConfessionDate}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            حفظ التاريخ
                        </button>
                    </div>
                )}

                {/* --- TIME RANGE TOGGLE --- */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex mb-6">
                    {[
                        { id: '1M', label: 'شهر ' },
                        { id: '3M', label: '3 أشهر' },
                        { id: '6M', label: '6 أشهر' },
                        { id: '1Y', label: 'سنة' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id)}
                            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                            timeRange === tab.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- CHARTS LIST --- */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-600">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-bold text-sm">جاري إنشاء الرسوم البيانية...</span>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
                        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد بيانات كافية</h3>
                        <p className="text-sm text-slate-500">قم بتسجيل تدريباتك اليومية لتبدأ الرسوم البيانية في الظهور هنا.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {chartData.map((activityChart) => (
                            <section
                                key={activityChart.id}
                                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <IconComponent name={activityChart.icon} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{activityChart.name_ar}</h3>
                                        <p className="text-xs font-medium text-slate-400">
                                            متوسط الإنجاز: <span className="text-indigo-600 font-bold">{activityChart.average}%</span>
                                        </p>
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

// --- Helper for Preview (Mocks data if backend fails) ---
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

