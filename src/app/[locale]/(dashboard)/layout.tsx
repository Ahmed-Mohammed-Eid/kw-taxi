import { Metadata } from 'next';
import Layout from '../../../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
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

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
