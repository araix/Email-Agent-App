'use client';

import { useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    KeyIcon,
    EnvelopeIcon,
    ServerIcon,
    ShieldCheckIcon,
    XMarkIcon,
    ChevronDownIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { upsertCredential } from '../actions';

export default function CredentialClient({ initialCredentials }) {
    const [credentials, setCredentials] = useState(initialCredentials);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        imapHost: '',
        imapPort: 993,
        imapUser: '',
        imapPassword: '',
        tls: true,
        type: 'warmup',
    });

    const handleEdit = (cred) => {
        setEditingId(cred.id);
        setFormData({
            ...cred,
            email: cred.email || '',
            smtpHost: cred.smtpHost || '',
            smtpPort: cred.smtpPort || 587,
            smtpUser: cred.smtpUser || '',
            smtpPassword: cred.smtpPassword || '',
            imapHost: cred.imapHost || '',
            imapPort: cred.imapPort || 993,
            imapUser: cred.imapUser || '',
            imapPassword: cred.imapPassword || '',
            type: cred.type || 'warmup',
        });
        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            email: '',
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            imapHost: '',
            imapPort: 993,
            imapUser: '',
            imapPassword: '',
            tls: true,
            type: 'warmup',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await upsertCredential(formData);
        if (result.success) {
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Connections</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure secure SMTP and IMAP channels.</p>
                </div>
                {!editingId && (
                    <button
                        onClick={() => setEditingId('new')}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Account</span>
                    </button>
                )}
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <EnvelopeIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Warmup Email</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Used for initial outreach. Requires both <b>Sending (SMTP)</b> and <b>Receiving (IMAP)</b> credentials for engagement tracking.</p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-2xl p-5 border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                            <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Final Email</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Used for the final conversion. <b>Sending (SMTP)</b> is required, but <b>Receiving (IMAP)</b> is optional.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Connection List */}
                <div className={`space-y-4 lg:col-span-4 ${editingId ? 'hidden lg:block' : 'block'}`}>
                    {credentials.map((cred) => (
                        <button
                            key={cred.id}
                            onClick={() => handleEdit(cred)}
                            className={`w-full text-left glass rounded-2xl p-5 border transition-all flex items-center justify-between ${editingId === cred.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                : 'hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                    <EnvelopeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{cred.email}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${cred.type === 'final' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                            {cred.type === 'final' ? 'Final' : 'Warmup'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono uppercase tracking-widest truncate">{cred.smtpHost}</p>
                                </div>
                            </div>
                            <ChevronDownIcon className="h-5 w-5 text-slate-300 dark:text-slate-600 lg:-rotate-90" />
                        </button>
                    ))}
                    {credentials.length === 0 && !editingId && (
                        <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/5">
                            <ServerIcon className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800" />
                            <p className="mt-4 text-slate-500 font-medium">No accounts configured</p>
                        </div>
                    )}
                </div>

                {/* Secure Form */}
                {editingId && (
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass rounded-3xl border border-indigo-500/20 p-6 sm:p-10 relative overflow-hidden bg-white/50 dark:bg-slate-950/50">
                            <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10 pointer-events-none">
                                <ShieldCheckIcon className="h-64 w-64 text-indigo-600" />
                            </div>

                            <div className="flex items-center justify-between mb-10 relative">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <LockClosedIcon className="h-6 w-6 text-indigo-500" />
                                    {editingId === 'new' ? 'New Connection' : 'Update Connection'}
                                </h2>
                                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10 relative">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block ml-1">Account Category</label>
                                            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'warmup' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.type === 'warmup' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Warmup
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: 'final' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.type === 'final' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                >
                                                    Final Email
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block ml-1">Account Identity</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                placeholder="e.g. outreach.agent@gmail.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* SMTP */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2 ml-1">
                                                <ServerIcon className="h-4 w-4 text-indigo-500" />
                                                SMTP (Sending)
                                            </div>
                                            <div className="space-y-4">
                                                <input
                                                    placeholder="SMTP Host (e.g. smtp.gmail.com)"
                                                    required
                                                    value={formData.smtpHost}
                                                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                />
                                                <div className="grid grid-cols-4 gap-4">
                                                    <input
                                                        placeholder="Port"
                                                        type="number"
                                                        required
                                                        value={formData.smtpPort}
                                                        onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                                                        className="col-span-1 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                    <input
                                                        placeholder="User"
                                                        required
                                                        value={formData.smtpUser}
                                                        onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                                                        className="col-span-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <KeyIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        placeholder="Password / App Password"
                                                        required
                                                        value={formData.smtpPassword}
                                                        onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* IMAP */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2 ml-1">
                                                <ServerIcon className="h-4 w-4 text-indigo-500" />
                                                IMAP (Receiving)
                                            </div>
                                            <div className="space-y-4">
                                                <input
                                                    placeholder="IMAP Host (e.g. imap.gmail.com)"
                                                    required={formData.type === 'warmup'}
                                                    value={formData.imapHost}
                                                    onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                />
                                                <div className="grid grid-cols-4 gap-4">
                                                    <input
                                                        placeholder="Port"
                                                        type="number"
                                                        value={formData.imapPort}
                                                        onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) })}
                                                        className="col-span-1 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                    <input
                                                        placeholder="User"
                                                        required={formData.type === 'warmup'}
                                                        value={formData.imapUser}
                                                        onChange={(e) => setFormData({ ...formData, imapUser: e.target.value })}
                                                        className="col-span-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <KeyIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        placeholder="Password / App Password"
                                                        required={formData.type === 'warmup'}
                                                        value={formData.imapPassword}
                                                        onChange={(e) => setFormData({ ...formData, imapPassword: e.target.value })}
                                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner placeholder-slate-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-10 border-t border-slate-100 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full sm:flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-mono"
                                    >
                                        DISCARD
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:flex-1 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheckIcon className="h-5 w-5" />
                                        VERIFY & SAVE
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
