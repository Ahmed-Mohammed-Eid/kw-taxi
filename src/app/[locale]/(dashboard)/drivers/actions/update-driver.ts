import axios from 'axios';
import { EditDriverFormValues } from '../schema/edit-driver.schema';

export const updateDriver = async (data: EditDriverFormValues, files: File[], locale: string, reset: () => void, router: any, toast: any, t: any, setIsSubmitting: (val: boolean) => void) => {
    setIsSubmitting(true);
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append all data fields including driverId and isActive
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                formData.append(key, value ? 'true' : 'false');
            } else if (typeof value === 'string' || typeof value === 'number') {
                formData.append(key, value.toString());
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        // Append files
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await axios.put(`${process.env.API_URL}/edit/driver`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {
            toast.current?.show({
                severity: 'success',
                summary: t('edit.successTitle'),
                detail: t('edit.successMessage'),
                life: 3000
            });
            reset();
            setTimeout(() => router.push(`/${locale}/drivers`), 1500);
        }
    } catch (error: any) {
        console.error('Failed to update driver:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('edit.errorTitle'),
            detail: error.response?.data?.message || t('edit.errorMessage'),
            life: 5000
        });
    } finally {
        setIsSubmitting(false);
    }
};
