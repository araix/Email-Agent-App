'use client';

import { useActionState } from 'react';
import { loginFormAction } from './actions';
import { LockClosedIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../components/ThemeToggle';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(loginFormAction, null);

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="absolute top-8 right-8">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-bounce-slow">
                    <ShieldCheckIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-8 text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Admin Login
                </h2>
                <p className="mt-2 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Secure access to your outreach command center.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 relative">
                    <form className="space-y-6" action={action}>
                        {state?.error && (
                            <div className="bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-semibold text-center animate-shake">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <UserIcon />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-500"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <LockClosedIcon />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>SIGN IN TO DASHBOARD</span>
                                        <LockClosedIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
