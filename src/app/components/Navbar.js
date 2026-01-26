'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import {
    UsersIcon,
    DocumentTextIcon,
    KeyIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { logoutAction } from '../actions';

const navigation = [
    { name: 'Leads', href: '/', icon: UsersIcon },
    { name: 'Templates', href: '/templates', icon: DocumentTextIcon },
    { name: 'Credentials', href: '/credentials', icon: KeyIcon },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="glass sticky top-0 z-50 border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold gradient-text hidden sm:block">Agent Dashboard</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex sm:items-center sm:gap-8">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        <form action={logoutAction} className="hidden sm:block">
                            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors">
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Logout
                            </button>
                        </form>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="sm:hidden p-2 text-zinc-500 dark:text-zinc-400"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden glass border-b p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive
                                        ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                {item.name}
                            </Link>
                        );
                    })}
                    <form action={logoutAction}>
                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-600/10 hover:text-red-600">
                            <ArrowRightOnRectangleIcon className="h-6 w-6" />
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </nav>
    );
}
