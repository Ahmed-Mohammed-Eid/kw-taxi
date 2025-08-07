/* eslint-disable @next/next/no-img-element */

import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '../types';
import { useTranslations,  } from 'next-intl';

const AppMenu = () => {
    const t = useTranslations('dashboard_sidebar');

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
            label: t('orders.title'),
            icon: 'pi pi-fw pi-home',
            items: [
                {
                    label: t('orders.title'),
                    icon: 'pi pi-fw pi-shopping-cart',
                    to: '/orders'
                },
                {
                    label: t('orders.pending'),
                    icon: 'pi pi-fw pi-clock',
                    to: '/orders/pending'
                },
                {
                    label: t('orders.create'),
                    icon: 'pi pi-fw pi-plus',
                    to: '/orders/create'
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
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
