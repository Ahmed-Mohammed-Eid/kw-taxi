import React from 'react';
import { useLocale } from 'next-intl';
import MapRouteSelector from '../../components/map-points/map-route-selector';
import DetailsCreateDialog from '../../components/detailscreate-dialog/detailscreate-dialog';

function OrdersPage() {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            <MapRouteSelector />
            <DetailsCreateDialog isRTL={isRTL} />
        </div>
    );
}

export default OrdersPage;
