'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ListOrdered, Eye, Filter as FilterIcon } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import ViewDialog from '../components/dialogs/view-dialog-all-orders';
import { getAllOrders } from '../actions/get-all-orders';
import type { Filter } from '../actions/get-all-orders';
import { useLocale } from 'next-intl';

// TYPES
import { Order } from '../actions/get-all-orders';
import { Calendar } from 'primereact/calendar';

function AllOrdersPage() {
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<Filter>({
        dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to one month ago
        dateTo: new Date()
    });
    const [viewingOrderDialog, setViewingOrderDialog] = useState({
        visible: false,
        order: null as Order | null
    });
    const [loading, setLoading] = useState(true);
    const t = useTranslations('dashboard_orders_all');

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllOrders(filter);
            if (response?.success && response.orders) {
                setOrders(response.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleViewOrder = (order: Order) => {
        setViewingOrderDialog({
            visible: true,
            order
        });
    };

    const handleCloseDialog = () => {
        setViewingOrderDialog({
            visible: false,
            order: null
        });
    };

    const handleFilter = () => {
        // Implement filtering logic here
        // For now, just log the filter values
        console.log('Filter applied:', filter);
    };

    const getStatusSeverity = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'in_progress':
                return 'primary';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getLatestStatus = (orderStatus: any[]) => {
        if (!orderStatus || orderStatus.length === 0) return 'pending';
        const latestStatus = orderStatus[orderStatus.length - 1];
        return latestStatus.state || 'pending';
    };

    const statusBodyTemplate = (rowData: Order) => {
        const status = getLatestStatus(rowData.orderStatus);
        return <Tag value={t(`status.${status}`)} severity={getStatusSeverity(status) as any} className="text-sm" />;
    };

    const paymentStatusBodyTemplate = (rowData: Order) => {
        return <Tag value={t(`paymentStatus.${rowData.paymentStatus}`)} severity={rowData.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-sm" />;
    };

    const priceBodyTemplate = (rowData: Order) => {
        return <span className="font-semibold">${rowData.orderPrice?.toFixed(2)}</span>;
    };

    const dateBodyTemplate = (rowData: Order) => {
        return new Date(rowData.orderDate).toLocaleDateString();
    };

    const actionBodyTemplate = (rowData: Order) => {
        return (
            <div className="flex gap-2">
                <Button icon={<Eye size={20} />} className="p-button-rounded p-button-info" rounded onClick={() => handleViewOrder(rowData)} tooltip={t('actions.view')} tooltipOptions={{ position: 'top' }} />
            </div>
        );
    };

    return (
        <div className="grid" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-2">
                            <h3 className="card-header flex justify-content-start align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                                <ListOrdered className="mr-2" size={24} />
                                {t('allOrders.title')}
                            </h3>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <Calendar value={filter.dateFrom || null} onChange={(e) => setFilter({ ...filter, dateFrom: e.value instanceof Date ? e.value : null })} dateFormat="mm/dd/yy" placeholder={t('filters.dateFrom')} className="flex-1" />
                        <Calendar value={filter.dateTo || null} onChange={(e) => setFilter({ ...filter, dateTo: e.value instanceof Date ? e.value : null })} dateFormat="mm/dd/yy" placeholder={t('filters.dateTo')} className="flex-1" />
                        <Button icon={<FilterIcon />} label={t('filters.filterButton')} onClick={handleFilter} className="flex-1" />
                    </div>

                    <DataTable
                        value={orders}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="p-datatable-sm"
                        emptyMessage={t('noOrders')}
                        globalFilterFields={['clientName', 'serviceType', 'orderNumber']}
                        sortField="createdAt"
                        sortOrder={-1}
                    >
                        <Column field="orderNumber" header={t('columns.orderNumber')} sortable style={{ width: '8%' }} />
                        <Column field="clientName" header={t('columns.clientName')} sortable style={{ width: '15%' }} />
                        <Column field="serviceType" header={t('columns.serviceType')} sortable style={{ width: '12%' }} />
                        <Column field="orderPrice" header={t('columns.price')} body={priceBodyTemplate} sortable style={{ width: '10%' }} />
                        <Column field="paymentStatus" header={t('columns.paymentStatus')} body={paymentStatusBodyTemplate} sortable style={{ width: '12%' }} />
                        <Column field="orderStatus" header={t('columns.status')} body={statusBodyTemplate} sortable style={{ width: '12%' }} />
                        <Column field="orderDate" header={t('columns.date')} body={dateBodyTemplate} sortable style={{ width: '12%' }} />
                        <Column field="paymentType" header={t('columns.paymentType')} sortable style={{ width: '12%' }} />
                        <Column body={actionBodyTemplate} header={t('columns.actions')} style={{ width: '8%' }} bodyStyle={{ textAlign: 'center' }} />
                    </DataTable>
                </div>
            </div>

            <ViewDialog visible={viewingOrderDialog.visible} order={viewingOrderDialog.order} onHide={handleCloseDialog} />
        </div>
    );
}

export default AllOrdersPage;
