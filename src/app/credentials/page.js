import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getCredentials } from '../actions';
import CredentialClient from './CredentialClient';
import { Navbar } from '../components/Navbar';

export default async function CredentialsPage() {
    if (!(await isAuthenticated())) {
        redirect('/login');
    }

    const initialCredentials = await getCredentials();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <CredentialClient initialCredentials={initialCredentials} />
                </div>
            </main>
        </div>
    );
}
