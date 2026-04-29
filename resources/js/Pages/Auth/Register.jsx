import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Phone, Lock, UserPlus, Sparkles } from 'lucide-react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
            <Head title="إنشاء حساب | النظام الروحي" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* --- HEADER SECTION --- */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform rotate-3">
                        <Sparkles className="h-8 w-8 text-white -rotate-3" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        حساب جديد
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        ابدأ رحلتك الروحية الخاصة معنا اليوم
                    </p>
                </div>

                {/* --- FORM CARD --- */}
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-10 relative overflow-hidden">
                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <form onSubmit={submit} className="space-y-5 relative z-10">

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                                الاسم الكامل
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full pr-10 py-3 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50 transition-colors"
                                    autoComplete="name"
                                    isFocused={true}
                                    placeholder="الاسم "
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Phone Number Input */}
                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-bold text-slate-700 mb-2">
                                رقم الهاتف
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <TextInput
                                    id="phone_number"
                                    type="tel"
                                    name="phone_number"
                                    value={data.phone_number}
                                    className="block w-full pr-10 py-3 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50 transition-colors"
                                    autoComplete="tel"
                                    placeholder="01xxxxxxxxx"
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <InputError message={errors.phone_number} className="mt-2" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pr-10 py-3 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50 transition-colors"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Password Confirmation Input */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-bold text-slate-700 mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pr-10 py-3 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 bg-slate-50 transition-colors"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`
                                w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white
                                transition-all duration-300 mt-6
                                ${processing
                                ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
                            }
                            `}
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    <span>إنشاء الحساب</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-sm text-slate-600 relative z-10">
                        لديك حساب بالفعل؟{' '}
                        <Link href={route('login')} className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}
