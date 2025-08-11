'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Eye, Send } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import ViewDialog from '../../components/dialogs/view-dialog';
import { SendOrderDialog } from '../../components/dialogs/send-order-dialog';
import { getPendingOrders } from '../../actions/get-pending-orders';

// TYPES
import { Order } from '../../actions/get-pending-orders';

function PendingOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [viewingOrderDialog, setViewingOrderDialog] = useState({
        visible: false,
        order: null as Order | null
    });
    const [sendingOrderDialogState, setSendingOrderDialogState] = useState({
        visible: false,
        order: null as Order | null
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch pending orders data when the component mounts
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            setLoading(true);
            const response = await getPendingOrders();
            if (response.success) {
                setOrders(response.pendingOrders || []);
            }
        } catch (error) {
            console.error('Error fetching pending orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const showOrderDialog = useCallback(
        (order: Order | null) => {
            setViewingOrderDialog({ visible: !viewingOrderDialog.visible, order });
        },
        [viewingOrderDialog]
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (timeString: string) => {
        return timeString;
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

    const getCurrentStatus = (order: Order) => {
        if (!order.orderStatus || order.orderStatus.length === 0) return 'pending';
        const latestStatus = order.orderStatus[order.orderStatus.length - 1];
        return latestStatus.state;
    };

    const t = useTranslations('dashboard_orders_pending');

    return (
        <div className="card mb-0 rtl">
            <div className="flex justify-content-between align-items-center mb-4">
                <h3 className="card-header flex justify-content-start align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                    <Clock stroke="var(--primary-color)" />
                    {t('title')}
                </h3>
            </div>
            <hr />
            <DataTable
                value={orders}
                className="p-datatable-striped"
                emptyMessage={t('dataTable.empty')}
                paginator
                rows={10}
                loading={loading}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
                rowsPerPageOptions={[10, 20, 30]}
            >
                <Column field="orderNumber" header={t('dataTable.Order.orderNumber')} />
                <Column field="clientName" header={t('dataTable.Order.clientName')} />
                <Column field="orderDate" header={t('dataTable.Order.orderDate')} body={(rowData) => formatDate(rowData.orderDate)} />
                <Column field="orderTime" header={t('dataTable.Order.orderTime')} body={(rowData) => formatTime(rowData.orderTime)} />
                <Column field="serviceType" header={t('dataTable.Order.serviceType')} />
                <Column field="orderPrice" header={t('dataTable.Order.orderPrice')} body={(rowData) => `${rowData.orderPrice} KD`} />
                <Column field="paymentStatus" header={t('dataTable.Order.paymentStatus')} body={(rowData) => <Tag value={rowData.paymentStatus} severity={getStatusSeverity(rowData.paymentStatus)} />} />
                <Column field="status" header={t('dataTable.Order.status')} body={(rowData) => <Tag value={getCurrentStatus(rowData)} severity={getStatusSeverity(getCurrentStatus(rowData))} />} />
                <Column
                    field="actions"
                    header={t('dataTable.Order.actions.title')}
                    body={(rowData) => {
                        const isLastStatusPending = getCurrentStatus(rowData) === 'pending';

                        return (
                            <div className="flex gap-2">
                                <Button icon={<Eye size={20} />} className="p-button-rounded p-button-info" tooltip={t('dataTable.Order.actions.view')} tooltipOptions={{ position: 'top' }} onClick={() => showOrderDialog(rowData)} />
                                {isLastStatusPending && (<Button
                                    icon={<Send size={20} />}
                                    className="p-button-rounded p-button-success"
                                    tooltip={t('dataTable.Order.actions.send')}
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => {
                                        setSendingOrderDialogState({ visible: true, order: rowData });
                                    }}
                                />)}
                            </div>
                        );
                    }}
                />
            </DataTable>
            <ViewDialog visible={viewingOrderDialog.visible} onHide={() => setViewingOrderDialog({ visible: false, order: null })} order={viewingOrderDialog.order} />
            <SendOrderDialog onHide={() => setSendingOrderDialogState({ order: null, visible: false })} visible={sendingOrderDialogState.visible} orderId={sendingOrderDialogState.order?._id} orderNumber={sendingOrderDialogState.order?.orderNumber} />
        </div>
    );
}

export default PendingOrdersPage;
