/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '../types';
import { useTranslations, useLocale } from 'next-intl';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const t = useTranslations('dashboard_sidebar');
    // const locale = useLocale();

    const model: AppMenuItem[] = [
        {
            label: t('dashboard.title'),
            icon: 'pi pi-fw pi-home',
            to: '/dashboard',
            items: [
                {
                    label: t('drivers.title'),
                    icon: 'pi pi-fw pi-users',
                    to: '/drivers'
                }
            ]
        },
        {
            label: t('settings.title'),
            items: [
                {
                    label: t('settings.logout'),
                    // icon: locale === 'en' ? 'pi pi-sign-out' : 'pi pi-sign-in',
                    icon: 'pi pi-sign-out',
                    to: '/login',
                    command: () => {
                        // Clear local storage
                        localStorage.clear();
                        // Clear Cookies
                        document.cookie.split(';').forEach((c) => {
                            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                        });
                        // Redirect to login page
                        window.location.href = '/login';
                    }
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

                <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link>
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
