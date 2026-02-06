'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    PlusIcon,
    XMarkIcon,
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    ChevronRightIcon,
    BuildingOfficeIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { addLead, importLeads } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LEAD_STATUS } from '@/lib/constants';

export default function DashboardClient({ initialLeads, pagination }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [importText, setImportText] = useState('');
    const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const closeModal = () => {
        setIsOpen(false);
        setName('');
        setEmail('');
        setCompany('');
        setImportText('');
        setError('');
        setActiveTab('single');
    };

    const openModal = () => setIsOpen(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await addLead(name, email, company);
            if (result.success) {
                closeModal();
                window.location.reload();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await importLeads(importText);
            if (result.success) {
                closeModal();
                window.location.reload();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        Leads Management
                        <span className="text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                            {pagination?.total || 0} total
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Track and manage your potential customer outreach.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={openModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add New Lead
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block flow-root overflow-hidden glass rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5">
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Name</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Email</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Company</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Status</th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Added</th>
                                <th scope="col" className="relative py-4 pl-3 pr-6 sm:pr-0">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {initialLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm font-semibold text-slate-900 dark:text-white">
                                        <Link href={`/leads/${lead.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            {lead.name}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400 font-mono">{lead.email}</td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-900 dark:text-white font-medium">{lead.company || '-'}</td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ${lead.status === LEAD_STATUS.PENDING ? 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400' :
                                            lead.status === LEAD_STATUS.FIRST_SENT ? 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400' :
                                                lead.status === LEAD_STATUS.SECOND_SENT ? 'bg-indigo-100 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400' :
                                                    lead.status === LEAD_STATUS.RESPONDED ? 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400' :
                                                        'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400'
                                            }`}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400 italic">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium sm:pr-0">
                                        <Link href={`/leads/${lead.id}`} className="pr-6">
                                            <ChevronRightIcon className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all ml-auto" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {initialLeads.length === 0 && (
                        <div className="py-20 text-center">
                            <UserIcon className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-800" />
                            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No leads found</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden space-y-4">
                {initialLeads.map((lead) => (
                    <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="block glass rounded-2xl p-4 active:scale-95 transition-transform"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white">{lead.name}</h3>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${lead.status === LEAD_STATUS.PENDING ? 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400' :
                                lead.status === LEAD_STATUS.FIRST_SENT ? 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400' :
                                    lead.status === LEAD_STATUS.SECOND_SENT ? 'bg-indigo-100 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400' :
                                        lead.status === LEAD_STATUS.RESPONDED ? 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400' :
                                            'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400'
                                }`}>
                                {lead.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono break-all">{lead.email}</p>
                        {lead.company && (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                                <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                                {lead.company}
                            </p>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                    </Link>
                ))}
                {initialLeads.length === 0 && (
                    <div className="text-center py-10 glass rounded-2xl">
                        <p className="text-slate-500 italic">No leads added yet</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 px-4 py-3 sm:px-6 mt-4">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => router.push(`/?page=${Math.max(1, pagination.page - 1)}`)}
                            disabled={pagination.page <= 1}
                            className="relative inline-flex items-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => router.push(`/?page=${Math.min(pagination.totalPages, pagination.page + 1)}`)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700 dark:text-slate-400">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => router.push(`/?page=${Math.max(1, pagination.page - 1)}`)}
                                    disabled={pagination.page <= 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronRightIcon className="h-5 w-5 rotate-180" aria-hidden="true" />
                                </button>
                                {/* Simple Page X of Y */}
                                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:outline-offset-0">
                                    Page {pagination.page} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => router.push(`/?page=${Math.min(pagination.totalPages, pagination.page + 1)}`)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl transition-all w-full max-w-lg border border-slate-200 dark:border-white/10">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                                Add Leads
                                            </Dialog.Title>
                                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Add a single lead or import them in bulk from a comma-separated list.
                                        </p>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
                                        <button
                                            onClick={() => setActiveTab('single')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'single' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            Single Lead
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('bulk')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'bulk' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            <DocumentDuplicateIcon className="h-4 w-4" />
                                            Bulk Import
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-400/10 p-3 rounded-xl border border-red-200 dark:border-red-400/20">
                                            {error}
                                        </div>
                                    )}

                                    {activeTab === 'single' ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                        placeholder="What's their name?"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
                                                <div className="relative">
                                                    <EnvelopeIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                        placeholder="hello@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Company (Optional)</label>
                                                <div className="relative">
                                                    <BuildingOfficeIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={company}
                                                        onChange={(e) => setCompany(e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                        placeholder="Company name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="w-full sm:flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full sm:flex-1 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                                                >
                                                    {loading ? 'Adding...' : 'Add Lead'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Paste Leads</label>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 ml-1">
                                                    Format: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Name, Email, Company</span> (One per line)
                                                </p>
                                                <textarea
                                                    required
                                                    rows={8}
                                                    value={importText}
                                                    onChange={(e) => setImportText(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 text-slate-900 dark:text-white placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                                                    placeholder={`John Doe, john@example.com, Acme Corp\nJane Smith, jane@example.com, Tech Solutions`}
                                                />
                                            </div>
                                            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="w-full sm:flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full sm:flex-1 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                                                >
                                                    {loading ? 'Importing...' : 'Import Leads'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
