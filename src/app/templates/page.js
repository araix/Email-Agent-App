import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getTemplates } from '../actions';
import TemplateClient from './TemplateClient';
import { Navbar } from '../components/Navbar';

export default async function TemplatesPage() {
    if (!(await isAuthenticated())) {
        redirect('/login');
    }

    const initialTemplates = await getTemplates();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <TemplateClient initialTemplates={initialTemplates} />
                </div>
            </main>
        </div>
    );
}
