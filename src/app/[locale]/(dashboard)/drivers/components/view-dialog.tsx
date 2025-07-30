import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';

// TYPES
import { Driver } from '../actions/get-drivers';

interface ViewDialogProps {
    visible: boolean;
    onHide: () => void;
    driver: Driver | null;
}

function ViewDialog({ visible, onHide, driver }: ViewDialogProps) {
    return (
        <Dialog
            header="عرض بيانات السائق"
            visible={visible && driver !== null}
            onHide={onHide}
            style={{
                width: `96%`,
                maxWidth: `800px`
            }}
        >
            <div className="grid p-fluid" dir='rtl'>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>اسم السائق</h5>
                        <p>{driver?.driverName}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>رقم الهاتف</h5>
                        <p>{driver?.phoneNumber}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>رقم الرخصة</h5>
                        <p>{driver?.licenseNumber}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>اسم الشركة</h5>
                        <p>{driver?.companyName}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>رقم السيارة</h5>
                        <p>{driver?.carNumber}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>رقم الرخصة</h5>
                        <p>{driver?.licenseNumber}</p>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>الحالة</h5>
                        <Tag value={driver?.isActive ? 'نشط' : 'غير نشط'} severity={driver?.isActive ? 'success' : 'danger'} />
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>حالة الموافقة</h5>
                        <Tag value={driver?.isApproved ? 'موافق عليه' : 'غير موافق عليه'} severity={driver?.isApproved ? 'success' : 'danger'} />
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="p-field">
                        <h5>تقييم السائق</h5>
                        <Rating value={driver?.averageRating} readOnly cancel={false} />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

export default ViewDialog;
