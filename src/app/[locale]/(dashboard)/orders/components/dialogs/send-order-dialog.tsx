import { useEffect, useState } from 'react';

import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getAvailableDrivers } from '../../actions/get-available-drivers';
import { sendOrder } from '../../actions/send-order';
import { sendOrderSchema } from '../../schemas/sendorder-schema';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import type { Driver } from '../../actions/get-available-drivers';

// Define the form data type
type SendOrderFormData = {
    driverPhone: string;
};

type SendOrderDialogProps = {
    visible: boolean;
    onHide: () => void;
    orderId: string | undefined;
    orderNumber: number | undefined;
};

export function SendOrderDialog({ visible, onHide, orderId, orderNumber }: SendOrderDialogProps) {
    const [listOfDrivers, setListOfDrivers] = useState<Driver[]>([]);

    const t = useTranslations('dashboard_orders_pending');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<SendOrderFormData>({
        // <-- Add generic type here
        resolver: zodResolver(sendOrderSchema(t))
    });

    useEffect(() => {
        if (visible && orderId) {
            getAvailableDrivers(orderId).then((drivers) => {
                setListOfDrivers(drivers);
            });
        }
    }, [visible, orderId]);

    const handleSendOrder = handleSubmit((data) => {
        // Implement send order logic here
        // Example: sendOrder(orderId, data.driverId);
        if (orderId) {
            sendOrder({ orderId, driverPhone: data.driverPhone })
        }
    });

    return (
        <Dialog
            header={t('sendDialog.header', { orderNumber: orderNumber || 'N/A' })}
            visible={visible}
            onHide={() => {
                reset();
                setListOfDrivers([])
                onHide();
            }}
            style={{
                width: '90vw',
                maxWidth: '800px',
                direction: isRTL ? 'rtl' : 'ltr'
            }}
        >
            {/* Dialog content goes here */}
            <form className="card mb-0 flex flex-column gap-2" onSubmit={handleSendOrder}>
                <Controller
                    name="driverPhone"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <>
                            <label htmlFor="driver">{t("sendDialog.driver")}</label>
                            <Dropdown {...field} id="driver" placeholder={t("sendDialog.selectDriverPlaceholder")} options={listOfDrivers} optionLabel="driverName" optionValue="phoneNumber" filter className="flex-1" />
                            {errors.driverPhone && <small className="p-error">{errors.driverPhone.message}</small>}
                        </>
                    )}
                />
                <Button label={t("sendDialog.send")} className="flex-1" type="submit" />
            </form>
        </Dialog>
    );
}
