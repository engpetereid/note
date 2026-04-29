import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Phone, Lock, LogIn, Sparkles } from 'lucide-react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

export default function Login({ status}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone_number: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
            <Head title="تسجيل الدخول | النظام الروحي" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* --- HEADER SECTION --- */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform rotate-3">
                        <Sparkles className="h-8 w-8 text-white -rotate-3" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        مرحباً بعودتك
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        سجل دخولك لمتابعة قانونك ورحلتك الروحية
                    </p>
                </div>

                {/* --- FORM CARD --- */}
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100 sm:px-10 relative overflow-hidden">
                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 relative z-10">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6 relative z-10">

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
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="01xxxxxxxxx"
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    dir="ltr"
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
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember & Forgot Password Row */}
                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5"
                                />
                                <span className="mr-2 text-sm text-slate-600 font-medium">
                                    تذكرني
                                </span>
                            </label>

                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`
                                w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white
                                transition-all duration-300 mt-2
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
                                    <LogIn size={20} />
                                    <span>دخول للمتابعة</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-sm text-slate-600 relative z-10">
                        ليس لديك حساب؟{' '}
                        <Link href={route('register')} className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline">
                            أنشئ حسابك الآن
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}
