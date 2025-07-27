import { Metadata } from 'next';
import Layout from '../../../../layout/layout';
import { useLocale } from 'next-intl';
import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';

interface AppLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
    title: 'KW Taxi',
    description: '.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'KW Taxi',
        url: 'https://kw-taxi.com/',
        description: 'KW Taxi - Your reliable taxi service.',
        images: ['https://kw-taxi.com/static/social/kw-taxi.png'],
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export default async function AppLayout({ children, params }: AppLayoutProps) {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { locale } = await params;

    if (!token) {
        // Redirect to login if no token is found
        return redirect({
            href: `/login`,
            locale: locale
        });
    }

    return <Layout>{children}</Layout>;
}
