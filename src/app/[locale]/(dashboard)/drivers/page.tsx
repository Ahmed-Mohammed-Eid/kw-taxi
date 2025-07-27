'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CarTaxiFront, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

// TOAST
import { toast } from 'react-hot-toast';

// ACTIONS
import { getDrivers } from './actions/get-drivers';

function DriversPage() {
    const [drivers, setDrivers] = useState([]);


    useEffect(() => {
        // Fetch drivers data when the component mounts
        getDrivers()
            .then((data) => {
                setDrivers(data.drivers || []);
            })
            .catch((error) => {
                console.error('Error fetching drivers:', error);
            });
    }, []);

    const t = useTranslations('dashboard_drivers_main');
    return (
        <div className="card mb-0 rtl">
            <h3 className="card-header flex justify-content-start align-items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                <CarTaxiFront stroke="var(--primary-color)" />
                {t('title')}
            </h3>
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
                            <Button icon={<Eye size={20} />} className="p-button-rounded p-button-info" tooltip={t('dataTable.Driver.actions.view')} tooltipOptions={{ position: 'top' }} />
                            <Button
                                icon={<Edit size={20} />}
                                className="p-button-rounded p-button-secondary"
                                tooltip={t('dataTable.Driver.actions.edit')}
                                tooltipOptions={{ position: 'top' }}
                                // onClick={() => handleEdit(rowData)}
                            />
                            <Button icon={<Trash2 size={20} />} className="p-button-rounded p-button-danger" tooltip={t('dataTable.Driver.actions.delete')} tooltipOptions={{ position: 'top' }} />
                        </div>
                    )}
                />
            </DataTable>
        </div>
    );
}

export default DriversPage;
