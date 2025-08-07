'use client';
import { LayoutProvider } from '../../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../../styles/layout/layout.scss';

import { Toaster } from 'react-hot-toast';

import { addLocale } from 'primereact/api';
import arEG from './[locale]/(dashboard)/orders/primereact-locals/ar';

// Register ar-EG locale
addLocale('ar-EG', arEG);

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootClientLayout({ children }: RootLayoutProps) {
    return (
        <>
            <PrimeReactProvider>
                <LayoutProvider>{children}</LayoutProvider>
            </PrimeReactProvider>
            <Toaster position="top-center" />
        </>
    );
}
