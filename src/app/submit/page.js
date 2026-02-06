'use client';

import { useState } from 'react';
import { PaperAirplaneIcon, UserIcon, BuildingOfficeIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../components/ThemeToggle';

export default function SubmitLeadPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        secret: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors on user input
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage(data.message);
            setFormData({ name: '', email: '', company: '', secret: '' }); // Clear form

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Background patterns matching Login page */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="absolute top-8 right-8">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-bounce-slow">
                    <PaperAirplaneIcon className="h-9 w-9 text-white transform -rotate-45 translate-x-1" />
                </div>
                <h2 className="mt-8 text-center text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Submit Lead
                </h2>
                <p className="mt-2 text-center text-slate-500 dark:text-slate-400 font-medium">
                    Add a new prospect to the outreach queue.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Updated container to match Login page 'glass' style more closely if needed, but keeping the white/slate structure from previous step which was good, just updating colors */}
                <div className="glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-semibold text-center animate-shake">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-2xl text-sm font-semibold text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <UserIcon />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="Full Name (optional)"
                                />
                            </div>

                            {/* Email Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <EnvelopeIcon />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="Email Address"
                                />
                            </div>

                            {/* Company Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <BuildingOfficeIcon />
                                </div>
                                <input
                                    id="company"
                                    name="company"
                                    type="text"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="Company Name (optional)"
                                />
                            </div>

                            {/* Divider for Secret */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white/0 px-2 text-xs text-slate-400 uppercase tracking-widest font-semibold backdrop-blur-sm">Security</span>
                                </div>
                            </div>

                            {/* Secret Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <KeyIcon />
                                </div>
                                <input
                                    id="secret"
                                    name="secret"
                                    type="password"
                                    required
                                    value={formData.secret}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 py-3.5 pl-12 pr-4 text-slate-900 dark:text-white shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="Secret Phrase"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>SUBMIT LEAD</span>
                                        <PaperAirplaneIcon className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
