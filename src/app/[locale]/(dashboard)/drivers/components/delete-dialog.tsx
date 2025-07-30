import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Driver } from '../actions/get-drivers';
import { deleteDriver } from '../actions/delete-driver';
// TOAST
import { toast } from 'react-hot-toast';

import { Trash2, StepBack } from 'lucide-react';

interface DeleteDialogProps {
    visible: boolean;
    onHide: () => void;
    driver: Driver | null;
    onDeleted?: () => void; // Optional callback after successful delete
}

function DeleteDialog({ visible, onHide, driver, onDeleted }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!driver) return;
        setLoading(true);
        setError(null);
        try {
            await deleteDriver(driver._id);
            setLoading(false);
            if (onDeleted) onDeleted();
            onHide();
            toast.success('تم حذف السائق بنجاح.');
        } catch (err: any) {
            setLoading(false);
            setError('حدث خطأ أثناء حذف السائق.');
            toast.error(err?.response?.data?.message || err?.message);
        }
    };

    return (
        <Dialog
            header="حذف السائق"
            visible={visible && driver !== null}
            onHide={onHide}
            style={{ width: `96%`, maxWidth: `400px` }}
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button label="إلغاء" icon={<StepBack />} onClick={onHide} className="p-button-text flex gap-2" disabled={loading} />
                    <Button label="حذف" icon={<Trash2 />} onClick={handleDelete} className="p-button-danger flex gap-2" loading={loading} autoFocus />
                </div>
            }
        >
            <div dir="rtl">
                <p className='capitalize'>
                    هل أنت متأكد أنك تريد حذف السائق <strong style={{ color: 'hsla(0, 84%, 60%, 1)' }}>{driver?.driverName}</strong>
                </p>
                {error && <p style={{ color: 'hsla(0, 84%, 60%, 1)' }}>{error}</p>}
            </div>
        </Dialog>
    );
}

export default DeleteDialog;
