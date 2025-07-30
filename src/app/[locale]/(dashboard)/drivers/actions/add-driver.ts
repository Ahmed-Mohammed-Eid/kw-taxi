import { DriverFormValues } from '../schema/driver.schema';
import axios from 'axios';

export const submitDriver = async (
    data: DriverFormValues,
    files: File[],
    locale: string,
    reset: () => void,
    router: any,
    toast: any,
    t: any,
    setIsSubmitting: (val: boolean) => void
) => {
    setIsSubmitting(true);
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                formData.append(key, value ? 'true' : 'false');
            } else if (typeof value === 'string' || typeof value === 'number') {
                formData.append(key, value.toString());
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        files.forEach((file) => {
            formData.append('files', file);
        });
        const response = await axios.post(`${process.env.API_URL}/create/driver`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.status === 201) {
            toast.current?.show({
                severity: 'success',
                summary: t('add.successTitle'),
                detail: t('add.successMessage'),
                life: 3000
            });
            reset();
            setTimeout(() => router.push(`/${locale}/drivers`), 1500);
        }
    } catch (error: any) {
        console.error('Failed to create driver:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('add.errorTitle'),
            detail: error.response?.data?.message || t('add.errorMessage'),
            life: 5000
        });
    } finally {
        setIsSubmitting(false);
    }
};
