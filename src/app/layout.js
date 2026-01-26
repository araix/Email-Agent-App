import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Admin Dashboard | Email Outreach',
    description: 'Manage your leads and outreach campaigns',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen antialiased`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
