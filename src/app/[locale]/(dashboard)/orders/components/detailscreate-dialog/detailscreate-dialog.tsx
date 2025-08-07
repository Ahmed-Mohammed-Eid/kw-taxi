'use client';

import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import { useTranslations } from 'next-intl';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createOrderSchema, { CreateOrderSchemaType } from '../../schemas/createorder-schema';

import mapManagementStore from '../../stores/map-management';

import { createOrder } from '../../actions/create-order';
import type { CreateOrderRequestData, DestinationPoint } from '../../actions/create-order';
import type { DeliveryRoute } from '../../actions/calculate-delivery-data';
import type { RouteDataPoint } from '../map-points/map-route-selector';

type DetailsCreateDialogProps = {
    isRTL: boolean;
};

function DetailsCreateDialog({ isRTL }: DetailsCreateDialogProps) {
    const t = useTranslations('dashboard_orders_main');

    const {
        routeData,
        calculatedDataDialog: { data, onHide, visible }
    } = mapManagementStore();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CreateOrderSchemaType>({
        resolver: zodResolver(createOrderSchema(t)),
        defaultValues: {
            customerName: '',
            clientPhone: '',
            orderDate: new Date(),
            orderTime: new Date(),
            serviceType: 'transportation',
            paymentType: 'cash',
            paymentMethod: 'knet'
        }
    });

    const onSubmit = async (formData: CreateOrderSchemaType) => {
        // GET THE HOURS FROM THE ORDER TIME AND MINUTES
        const orderTime = new Date(formData.orderTime);
        const hours = orderTime.getHours();
        const minutes = orderTime.getMinutes();

        // CALCULATE THE DISTANCES OF ALL ROUTES
        const totalDistance = data?.locationsData.reduce((acc: number, loc: DeliveryRoute) => acc + loc.distance, 0) || 0;

        // FORMAT THE DESTINATIONS
        const formattedDestinations: DestinationPoint[] = [];
        routeData.fromPoints.forEach((fromPoint: RouteDataPoint, index: number) => {
            const obj: DestinationPoint = {
                fromPoint: {
                    lat: fromPoint.coordinates.lat,
                    lng: fromPoint.coordinates.lng
                },
                toPoint: {
                    lat: routeData.toPoints[index]?.coordinates.lat,
                    lng: routeData.toPoints[index]?.coordinates.lng
                },
                fromAddress: fromPoint.address,
                toAddress: routeData.toPoints[index]?.address || 'Unknown'
            };
            formattedDestinations.push(obj);
        });

        const requestData: CreateOrderRequestData = {
            clientName: formData.customerName,
            clientPhone: formData.clientPhone,
            serviceType: formData.serviceType,
            paymentType: formData.paymentType,
            paymentMethod: formData.paymentMethod,
            orderTime: `${hours}:${minutes}`,
            orderDate: formData.orderDate,
            orderPrice: data?.price || 0,
            distancePerKm: totalDistance,
            destination: formattedDestinations
        };

        // CREATE THE ORDER
        await createOrder(requestData);

        // Reset the dialog state
        onHide();
    };

    // Reset form when dialog becomes visible
    useEffect(() => {
        if (visible) {
            reset();
        }
    }, [visible, reset]);

    return (
        <Dialog
            header={t('detailscreate_dialog.details')}
            visible={visible}
            onHide={onHide}
            style={{ width: '90%', maxWidth: '1024px', direction: isRTL ? 'rtl' : 'ltr' }}
        >
            {routeData.fromPoints.length > 0 && routeData.toPoints.length > 0 ? (
                <>
                    <h3>{t('detailscreate_dialog.routes')}</h3>
                    <div className="flex gap-2 flex-wrap">
                        {routeData.fromPoints.map((fromPoint: RouteDataPoint, index: number) => (
                            <div key={index} className="card text-sm p-4 m-0 flex-1">
                                <h5>{t('detailscreate_dialog.route', { index: index + 1 })}</h5>
                                <p style={{ color: 'green' }}>{t('detailscreate_dialog.from', { address: fromPoint.address })}</p>
                                <p style={{ color: 'red' }}>{t('detailscreate_dialog.to', { address: routeData.toPoints[index]?.address || 'Unknown' })}</p>
                                <hr />
                                {data && data.locationsData[index] ? (
                                    <div>
                                        <h6>{t('detailscreate_dialog.siteDetails')}</h6>
                                        <p>{t('detailscreate_dialog.distance', { distance: data.locationsData[index].distance.toFixed(2) })}</p>
                                        <p>{t('detailscreate_dialog.estimatedTime', { time: data.locationsData[index].estimatedTime.toFixed(2) })}</p>
                                        <p>{t('detailscreate_dialog.price', { price: data.locationsData[index].price.toFixed(2) })}</p>
                                    </div>
                                ) : (
                                    <p>{t('detailscreate_dialog.noData')}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="card p-4 mt-4">
                        <h4 className="mt-4">{t('detailscreate_dialog.totalPrice', { price: data?.price?.toFixed(2) ?? '0.00' })}</h4>
                    </div>
                    <div className="card">
                        <h4>{t('detailscreate_dialog.orderDetails')}</h4>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="customerName">{t('detailscreate_dialog.customerName')}</label>
                                    <Controller name="customerName" control={control} render={({ field }) => <InputText id="customerName" {...field} className={`inputtext ${errors.customerName ? 'p-invalid' : ''}`} />} />
                                    {errors.customerName && <small className="p-error">{errors.customerName.message as string}</small>}
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="clientPhone">{t('detailscreate_dialog.clientPhone')}</label>
                                    <Controller name="clientPhone" control={control} render={({ field }) => <InputText id="clientPhone" {...field} className={`inputtext ${errors.clientPhone ? 'p-invalid' : ''}`} />} />
                                    {errors.clientPhone && <small className="p-error">{errors.clientPhone.message as string}</small>}
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="orderDate">{t('detailscreate_dialog.orderDate')}</label>
                                    <Controller name="orderDate" control={control} render={({ field }) => <Calendar id="orderDate" {...field} className={`inputtext ${errors.orderDate ? 'p-invalid' : ''}`} locale={isRTL ? 'ar-EG' : ''} />} />
                                    {errors.orderDate && <small className="p-error">{errors.orderDate.message as string}</small>}
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="orderTime">{t('detailscreate_dialog.orderTime')}</label>
                                    <Controller
                                        name="orderTime"
                                        control={control}
                                        render={({ field }) => <Calendar id="orderTime" {...field} timeOnly hourFormat="12" className={`inputtext ${errors.orderTime ? 'p-invalid' : ''}`} locale={isRTL ? 'ar-EG' : ''} />}
                                    />
                                    {errors.orderTime && <small className="p-error">{errors.orderTime.message as string}</small>}
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="serviceType">{t('detailscreate_dialog.serviceType')}</label>
                                    <Controller
                                        name="serviceType"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="serviceType"
                                                {...field}
                                                options={[
                                                    { label: t('detailscreate_dialog.transportation'), value: 'transportation' },
                                                    { label: t('detailscreate_dialog.shipping'), value: 'shipping' }
                                                ]}
                                                className={`inputtext ${errors.serviceType ? 'p-invalid' : ''}`}
                                            />
                                        )}
                                    />
                                    {errors.serviceType && <small className="p-error">{errors.serviceType.message as string}</small>}
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="paymentType">{t('detailscreate_dialog.paymentType')}</label>
                                    <Controller
                                        name="paymentType"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="paymentType"
                                                {...field}
                                                options={[
                                                    { label: t('detailscreate_dialog.subscription'), value: 'subscription' },
                                                    { label: t('detailscreate_dialog.cash'), value: 'cash' }
                                                ]}
                                                className={`inputtext ${errors.paymentType ? 'p-invalid' : ''}`}
                                            />
                                        )}
                                    />
                                    {errors.paymentType && <small className="p-error">{errors.paymentType.message as string}</small>}
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="paymentMethod">{t('detailscreate_dialog.paymentMethod')}</label>
                                    <Controller
                                        name="paymentMethod"
                                        control={control}
                                        render={({ field }) => (
                                            <Dropdown
                                                id="paymentMethod"
                                                {...field}
                                                options={[
                                                    { label: t('detailscreate_dialog.knet'), value: 'knet' },
                                                    { label: t('detailscreate_dialog.link'), value: 'link' }
                                                ]}
                                                className={`inputtext ${errors.paymentMethod ? 'p-invalid' : ''}`}
                                            />
                                        )}
                                    />
                                    {errors.paymentMethod && <small className="p-error">{errors.paymentMethod.message as string}</small>}
                                </div>
                            </div>
                            <Button type="submit" label={t('detailscreate_dialog.createOrder')} style={{ width: '100%' }} />
                        </form>
                    </div>
                </>
            ) : (
                <p>{t('detailscreate_dialog.noRouteSelected')}</p>
            )}
        </Dialog>
    );
}

export default DetailsCreateDialog;
