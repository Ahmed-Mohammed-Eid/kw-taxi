'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Order } from '../../actions/get-pending-orders';
import { useLocale } from 'next-intl';

interface ViewDialogProps {
    visible: boolean;
    onHide: () => void;
    order: Order | null;
}

function ViewDialog({ visible, onHide, order }: ViewDialogProps) {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const t = useTranslations('dashboard_orders_pending.viewDialog');
    if (!order) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getCurrentStatus = () => {
        if (!order.orderStatus || order.orderStatus.length === 0) return 'pending';
        const latestStatus = order.orderStatus[order.orderStatus.length - 1];
        return latestStatus.state;
    };

    const getStatusSeverity = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'in-progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'info';
        }
    };


    return (
        <Dialog
            header={t('header', { orderNumber: order.orderNumber })}
            visible={visible}
            style={{ width: '90vw', maxWidth: '800px', direction: isRTL ? 'rtl' : 'ltr' }}
            onHide={onHide}
            maximizable
        >
            <div className="grid">
                <div className="col-12">
                    <h3>{t('orderDetails')}</h3>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('clientName')}</label>
                        <div>{order.clientName}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('orderDate')}</label>
                        <div>{formatDate(order.orderDate)}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('orderTime')}</label>
                        <div>{order.orderTime}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('serviceType')}</label>
                        <div>{order.serviceType}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('orderPrice')}</label>
                        <div>{order.orderPrice} KD</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('paymentType')}</label>
                        <div>{order.paymentType}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('paymentMethod')}</label>
                        <div>{order.paymentMethod}</div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('paymentStatus')}</label>
                        <div>
                            <Tag value={order.paymentStatus} severity={getStatusSeverity(order.paymentStatus)} />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('currentStatus')}</label>
                        <div>
                            <Tag value={getCurrentStatus()} severity={getStatusSeverity(getCurrentStatus())} />
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label className="font-bold">{t('distance')}</label>
                        <div>{order.distancePerKm} km</div>
                    </div>
                </div>
                <Divider />
                <div className="col-12">
                    <h4>{t('destinations')}</h4>
                    {order.destination.map((dest, index) => (
                        <div key={dest._id} className="mb-3">
                            <div className="grid">
                                <div className="col-12">
                                    <h5>{t('destination', { index: index + 1 })}</h5>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold">{t('fromAddress')}</label>
                                        <div>{dest.fromAddress}</div>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold">{t('toAddress')}</label>
                                        <div>{dest.toAddress}</div>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold">{t('fromCoordinates')}</label>
                                        <div>Lat: {dest.fromPoint.lat}, Lng: {dest.fromPoint.lng}</div>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-bold">{t('toCoordinates')}</label>
                                        <div>Lat: {dest.toPoint.lat}, Lng: {dest.toPoint.lng}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Divider />
                <div className="col-12">
                    <h4>{t('statusHistory')}</h4>
                    {order.orderStatus.map((status) => (
                        <div key={status._id} className="mb-2">
                            <div className="flex align-items-center gap-2">
                                <Tag value={status.state} severity={getStatusSeverity(status.state)} />
                                <span>{new Date(status.date).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Dialog>
    );
}

export default ViewDialog;