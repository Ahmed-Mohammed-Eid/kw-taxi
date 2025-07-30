'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CarTaxiFront, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import ViewDialog from '../components/view-dialog';
import DeleteDialog from '../components/delete-dialog';
import { useRouter } from 'next/navigation';

// ACTIONS
import { getDrivers } from '../actions/get-drivers';

// TYPES
import { Driver } from '../actions/get-drivers';

function DriversPage() {
    const router = useRouter();

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [viewingDriverDialog, setViewingDriverDialog] = useState({
        visible: false,
        driver: null as Driver | null
    });
    const [deletingDriverDialog, setDeletingDriverDialog] = useState({
        visible: false,
        driver: null as Driver | null
    });

    useEffect(() => {
        // Fetch drivers data when the component mounts
        getDrivers()
            .then((data) => {
                setDrivers(data || []);
            })
            .catch((error) => {
                console.error('Error fetching drivers:', error);
            });
    }, []);

    const showDriverDialog = useCallback(
        (driver: Driver | null) => {
            setViewingDriverDialog({ visible: !viewingDriverDialog.visible, driver });
        },
        [viewingDriverDialog]
    );

    const t = useTranslations('dashboard_drivers_main');
    return (
        <div className="card mb-0 rtl">
            <div className="flex justify-content-between align-items-center mb-4">
                <h3 className="card-header flex justify-content-start align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                    <CarTaxiFront stroke="var(--primary-color)" />
                    {t('title')}
                </h3>
                <Button label={t('addDriver')} icon={<Plus />} severity={'success'} onClick={() => router.push('/drivers/add')} />
            </div>
            <hr />
            <DataTable
                value={drivers}
                className="p-datatable-striped"
                emptyMessage={t('dataTable.empty')}
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} drivers"
                rowsPerPageOptions={[10, 20, 30]}
            >
                <Column field="driverName" header={t('dataTable.Driver.driverName')} />
                <Column field="phoneNumber" header={t('dataTable.Driver.phoneNumber')} />
                <Column field="licenseNumber" header={t('dataTable.Driver.licenseNumber')} />
                <Column field="companyName" header={t('dataTable.Driver.companyName')} />
                <Column field="carNumber" header={t('dataTable.Driver.carNumber')} />
                <Column
                    field="actions"
                    header={t('dataTable.Driver.actions.title')}
                    body={(rowData) => (
                        <div className="flex gap-2">
                            {/* View Button */}
                            <Button icon={<Eye size={20} />} className="p-button-rounded p-button-info" tooltip={t('dataTable.Driver.actions.view')} tooltipOptions={{ position: 'top' }} onClick={() => showDriverDialog(rowData)} />
                            <Button icon={<Edit size={20} />} className="p-button-rounded p-button-secondary" tooltip={t('dataTable.Driver.actions.edit')} tooltipOptions={{ position: 'top' }} onClick={() => router.push(`/drivers/${rowData._id}`)} />
                            <Button
                                icon={<Trash2 size={20} />}
                                className="p-button-rounded p-button-danger"
                                tooltip={t('dataTable.Driver.actions.delete')}
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => setDeletingDriverDialog({ visible: true, driver: rowData })}
                            />
                        </div>
                    )}
                />
            </DataTable>
            <ViewDialog visible={viewingDriverDialog.visible} onHide={() => setViewingDriverDialog({ visible: false, driver: null })} driver={viewingDriverDialog.driver} />
            <DeleteDialog
                visible={deletingDriverDialog.visible}
                onHide={() => setDeletingDriverDialog({ visible: false, driver: null })}
                driver={deletingDriverDialog.driver}
                onDeleted={() => {
                    // GET THE UPDATED DRIVERS LIST
                    getDrivers()
                        .then((data) => {
                            setDrivers(data || []);
                        })
                        .catch((error) => {
                            console.error('Error fetching drivers:', error);
                        });
                }}
            />
        </div>
    );
}

export default DriversPage;
