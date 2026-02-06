import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getLeads } from './actions';
import DashboardClient from './DashboardClient';
import { Navbar } from './components/Navbar';

export default async function DashboardPage({ searchParams }) {
    if (!(await isAuthenticated())) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const { leads, pagination } = await getLeads(page);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <DashboardClient initialLeads={leads} pagination={pagination} />
                </div>
            </main>
        </div>
    );
}
