import { Metadata } from 'next';
import Layout from '../../../../layout/layout';
import { useLocale } from 'next-intl';
import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import axios from 'axios';

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
        icon: '/logo.ico'
    }
};

const validateToken = async (token: string | null, locale: string) => {
    if (!token) {
        redirect({
            href: '/login',
            locale: locale
        });
    }

    // CHECK THAT TOKEN IS VALID
    try {
        const response = await axios.get(`${process.env.API_URL}/get/verify/token?token=${token}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.statusText !== 'OK') {
            redirect({
                href: '/login',
                locale: locale
            });
            throw new Error('Invalid token');
        }

        if (response.data?.decodedToken?.role !== 'admin') {
            redirect({
                href: '/unauthorized',
                locale: locale
            });
        }
    } catch (error) {
        redirect({
            href: '/login',
            locale: locale
        });
    }
};

export default async function AppLayout({ children, params }: AppLayoutProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const { locale } = await params;
    await validateToken(token || null, locale);

    return <Layout>{children}</Layout>;
}
