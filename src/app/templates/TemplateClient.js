'use client';

import { useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    EyeIcon,
    XMarkIcon,
    DocumentDuplicateIcon,
    CheckBadgeIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { upsertTemplate } from '../actions';

export default function TemplateClient({ initialTemplates }) {
    const [templates, setTemplates] = useState(initialTemplates);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [activationConflict, setActivationConflict] = useState(null); // { newTemplateData, conflictingTemplate }
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        senderName: '',
        senderCompany: '',
    });

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            ...template,
            name: template.name || '',
            subject: template.subject || '',
            body: template.body || '',
            senderName: template.senderName || '',
            senderCompany: template.senderCompany || '',
        });
        // Scroll to top on mobile when editing
        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resetForm = () => {
        setEditingTemplate(null);
        setFormData({
            name: 'firstEmail',
            subject: '',
            body: '',
            senderName: '',
            senderCompany: '',
            active: false
        });
    };

    const handleActivate = async (template) => {
        const result = await upsertTemplate({ ...template, active: true });
        if (result.success) window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for active conflict
        // If we are making this active (or it's new and we want to enforce active if none exists?)
        // Requirement: "Make sure there are always there Email Templates active"
        // Logic: Checks if there is ALREADY an active template for this name.
        const activeTemplate = templates.find(t => t.name === formData.name && t.active && t.id !== formData.id);

        if (activeTemplate) {
            // There is already an active one.
            // If the user hasn't explicitly set active=true context yet (which we don't have a UI for in the form besides this logic),
            // we should ASK them.
            // However, current formData doesn't have an 'active' checkbox.
            // So we assume they MIGHT want it active.

            // Logic:
            // 1. If we are editing an inactive template, or creating a new one.
            // 2. And there is a conflict.
            // 3. Ask: "Activate this?"
            setActivationConflict({
                newItem: { ...formData },
                existingItem: activeTemplate
            });
            return;
        }

        // If no active template exists for this type, force active
        const hasActive = templates.some(t => t.name === formData.name && t.active);
        const finalData = { ...formData };
        if (!hasActive && !finalData.active) {
            finalData.active = true;
        }

        await saveTemplate(finalData);
    };

    const saveTemplate = async (data) => {
        const result = await upsertTemplate(data);
        if (result.success) {
            window.location.reload();
        }
    };

    const confirmActivation = async (shouldActivate) => {
        if (!activationConflict) return;
        const data = { ...activationConflict.newItem, active: shouldActivate };
        await saveTemplate(data);
        setActivationConflict(null);
    };

    const previewBody = (body) => {
        return body
            .replace(/{{name}}/g, 'John Doe')
            .replace(/{{senderName}}/g, formData.senderName || 'Your Name')
            .replace(/{{senderCompany}}/g, formData.senderCompany || 'Your Company');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Templates</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Craft your perfect outreach sequence.</p>
                </div>
                {!editingTemplate && (
                    <button
                        onClick={() => setEditingTemplate({})}
                        className="flex h-10 w-10 sm:w-auto sm:h-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 sm:px-4 sm:py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">New Template</span>
                    </button>
                )}
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                            <PlayIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Phase 1: Warmup & Initial Outreach</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Use <strong>Gmail</strong> or a high-deliverability service for the <strong>First Email</strong>. This initial contact is optimized for "warmup" and ensuring your messages land in the primary inbox.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass rounded-2xl p-6 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                            <CheckBadgeIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Phase 2: Engagement & Conversion</h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Send the <strong>Second & Third Emails</strong> using your <strong>final company address</strong>. By replying to the first email's thread, we maintain context and drastically improve engagement rates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* List */}
                <div className={`space-y-4 lg:col-span-5 ${editingTemplate ? 'hidden lg:block' : 'block'}`}>
                    {templates.map((template) => (
                        <div key={template.id} className="relative group">
                            <button
                                onClick={() => handleEdit(template)}
                                className={`w-full text-left glass rounded-2xl p-5 border transition-all ${editingTemplate?.id === template.id
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                    : 'hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{template.name}</h3>
                                            {template.active && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                                    <CheckBadgeIcon className="h-3 w-3" />
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{template.subject}</p>
                                    </div>
                                    <PencilIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                </div>
                            </button>
                            {!template.active && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActivate(template);
                                    }}
                                    className="absolute top-5 right-12 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                    title="Set as Active"
                                >
                                    <PlayIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/5">
                            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800" />
                            <p className="mt-4 text-slate-500 font-medium">No templates found</p>
                        </div>
                    )}
                </div>

                {/* Editor */}
                {editingTemplate && (
                    <div className="space-y-6 lg:col-span-7">
                        <div className="glass rounded-3xl border p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formData.id ? 'Edit Template' : 'New Template'}
                                </h2>
                                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Template Type (Unique Name)</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            >
                                                <option value="" disabled>Select a template type</option>
                                                <option value="firstEmail">First Email</option>
                                                <option value="secondEmailNonResponders">Non Responder</option>
                                                <option value="secondEmailResponders">Responder</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Subject Line</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            placeholder="The email subject line"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Sender Name</label>
                                        <input
                                            type="text"
                                            value={formData.senderName}
                                            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Sender Company</label>
                                        <input
                                            type="text"
                                            value={formData.senderCompany}
                                            onChange={(e) => setFormData({ ...formData, senderCompany: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            placeholder="Your Company"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Body</label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm shadow-inner"
                                        placeholder="Hi {{name}}, ..."
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {['name', 'senderName', 'senderCompany'].map(v => (
                                            <span key={v} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                                                {`{{${v}}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full sm:flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:flex-1 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                                    >
                                        Save Template
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Activation Logic Modal */}
                        {activationConflict && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                                    <div className="text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 mb-4">
                                            <CheckBadgeIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activate Template?</h3>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            There is already an active template for <strong>{activationConflict.newItem.name}</strong>.
                                            Do you want to activate this new one and deactivate the old one?
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => confirmActivation(false)}
                                            className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                        >
                                            Keep Inactive
                                        </button>
                                        <button
                                            onClick={() => confirmActivation(true)}
                                            className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                                        >
                                            Yes, Activate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview Section */}
                        <div className="glass rounded-3xl border p-6 sm:p-8 overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <EyeIcon className="h-5 w-5 text-indigo-500" />
                                Live Preview
                            </h2>
                            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-inner border border-slate-100 dark:border-white/5">
                                <div className="mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Subject</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                                        {formData.subject || 'Subject will appear here'}
                                    </div>
                                </div>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 min-h-[200px]">
                                    {formData.body ? previewBody(formData.body) : 'Body content will appear here...'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
