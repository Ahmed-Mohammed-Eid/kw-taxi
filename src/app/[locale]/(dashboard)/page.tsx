"use client";

import { useTranslations } from 'next-intl';

export default function HomePage() {
    const t = useTranslations("dashboard/main");
    return (
        <div className='card rtl'>
            <h1>{t('title')}</h1>
        </div>
    );
}
