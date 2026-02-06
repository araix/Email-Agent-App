import { getLeadById } from '../../actions';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import {
    ChevronLeftIcon,
    EnvelopeIcon,
    ChatBubbleBottomCenterTextIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default async function LeadDetailPage({ params }) {
    if (!(await isAuthenticated())) {
        redirect('/login');
    }

    const { id } = await params;
    const lead = await getLeadById(id);

    if (!lead) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-10">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lead not found</h1>
                        <Link href="/" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400">Back to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    const activityGroups = [
        {
            title: 'Communication',
            items: [
                { label: 'Status', value: lead.status, icon: CheckCircleIcon, color: 'text-indigo-500' },
                { label: 'First Email', value: lead.firstEmailSentAt ? new Date(lead.firstEmailSentAt).toLocaleString() : 'Not sent', icon: EnvelopeIcon },
                { label: 'Follow-up Email', value: lead.secondEmailSentAt ? new Date(lead.secondEmailSentAt).toLocaleString() : 'Not sent', icon: EnvelopeIcon },
            ]
        },
        {
            title: 'Tracking Details',
            items: [
                { label: 'Responded At', value: lead.respondedAt ? new Date(lead.respondedAt).toLocaleString() : 'No response', icon: ChatBubbleBottomCenterTextIcon },
                { label: 'Created', value: new Date(lead.createdAt).toLocaleString(), icon: ClockIcon },
                { label: 'Bounce', value: lead.bouncedAt ? `Bounced on ${new Date(lead.bouncedAt).toLocaleString()}` : 'No bounce', icon: ExclamationCircleIcon, color: lead.bouncedAt ? 'text-red-500' : '' },
            ]
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 py-6 sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-8 transition-colors">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <header className="mb-10 px-1">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{lead.name}</h1>
                        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 font-mono italic break-all">{lead.email}</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activityGroups.map((group) => (
                            <div key={group.title} className="glass rounded-3xl border border-slate-200 dark:border-white/5 p-6 sm:p-8">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">{group.title}</h3>
                                <div className="space-y-6">
                                    {group.items.map((item) => (
                                        <div key={item.label} className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                <item.icon className={`h-5 w-5 ${item.color || 'text-slate-500 dark:text-slate-500'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <dt className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.label}</dt>
                                                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate">{item.value}</dd>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {lead.responseBody && (
                        <div className="mt-6 glass rounded-3xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center gap-2">
                                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-indigo-500" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full Response Content</h3>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap shadow-inner">
                                    {lead.responseBody}
                                </div>
                            </div>
                        </div>
                    )}

                    {lead.bounceReason && (
                        <div className="mt-6 glass rounded-3xl border border-red-500/10 p-6 sm:p-8 bg-red-500/5">
                            <dt className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Bounce Reason</dt>
                            <dd className="text-sm text-red-700 dark:text-red-400 font-medium">{lead.bounceReason}</dd>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
