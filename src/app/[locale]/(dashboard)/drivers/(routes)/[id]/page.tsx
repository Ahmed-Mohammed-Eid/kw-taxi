'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditDriverFormValues, EditDriverSchema } from '../../schema/edit-driver.schema';
import { updateDriver } from '../../actions/update-driver';
import { useLocale } from 'next-intl';
import FileUploadComponent, { FileObject } from '@/components/FileUploadComponent/FileUploadComponent';
import { getDriverDetails } from '../../actions/get-driver-details';
import toast from 'react-hot-toast';

export default function EditDriverPage() {
    const locale = useLocale();
    const router = useRouter();
    const params = useParams();
    const driverId = Array.isArray(params.id) ? params.id[0] : params.id;
    const t = useTranslations('dashboard_drivers_main');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<FileObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue
    } = useForm<EditDriverFormValues>({
        resolver: zodResolver(EditDriverSchema) as any,
        defaultValues: {
            driverId: driverId,
            driverName: '',
            phoneNumber: '',
            licenseNumber: '',
            companyName: '',
            carNumber: '',
            password: '',
            isActive: false,
            isApproved: false
        }
    });

    // Fetch driver details on mount
    useEffect(() => {
        const fetchDriverDetails = async () => {
            if (!driverId) return;

            try {
                const driverData = await getDriverDetails(driverId);
                setValue('driverId', driverId);
                setValue('driverName', driverData.driverName);
                setValue('phoneNumber', driverData.phoneNumber);
                setValue('licenseNumber', driverData.licenseNumber);
                setValue('companyName', driverData.companyName);
                setValue('carNumber', driverData.carNumber);
                setValue('isActive', driverData.isActive);
                setValue('isApproved', driverData.isApproved);
            } catch (error) {
                console.error('Error fetching driver details:', error);
                toast.error(t('edit.fetchErrorMessage'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverDetails();
    }, [driverId, setValue, t]);

    const onSubmit: SubmitHandler<EditDriverFormValues> = (data) => {
        const fileObjects = files.map((fileObj) => fileObj.file);
        updateDriver(data, fileObjects, locale, reset, router, toast, t, setIsSubmitting);
    };

    const handleFilesSelected = (fileList: FileList) => {
        const newFiles = Array.from(fileList).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending' as const,
            progress: 0
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (fileId: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="card rtl">
            <h3 className="card-header flex justify-content-start align-items-center gap-2 mb-4" style={{ color: 'var(--primary-color)' }}>
                {t('edit.title')}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="p-fluid formgrid grid">
                {/* Driver Name */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="driverName" className="font-medium mb-2 block">
                        {t('edit.driverName')}
                    </label>
                    <InputText id="driverName" {...register('driverName')} className={`w-full ${errors.driverName ? 'p-invalid' : ''}`} />
                    {errors.driverName && <small className="p-error">{errors.driverName.message}</small>}
                </div>

                {/* Phone Number */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="phoneNumber" className="font-medium mb-2 block">
                        {t('edit.phoneNumber')}
                    </label>
                    <InputText id="phoneNumber" {...register('phoneNumber')} className={`w-full ${errors.phoneNumber ? 'p-invalid' : ''}`} />
                    {errors.phoneNumber && <small className="p-error">{errors.phoneNumber.message}</small>}
                </div>

                {/* License Number */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="licenseNumber" className="font-medium mb-2 block">
                        {t('edit.licenseNumber')}
                    </label>
                    <InputText id="licenseNumber" {...register('licenseNumber')} className={`w-full ${errors.licenseNumber ? 'p-invalid' : ''}`} />
                    {errors.licenseNumber && <small className="p-error">{errors.licenseNumber.message}</small>}
                </div>

                {/* Company Name */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="companyName" className="font-medium mb-2 block">
                        {t('edit.companyName')}
                    </label>
                    <InputText id="companyName" {...register('companyName')} className={`w-full ${errors.companyName ? 'p-invalid' : ''}`} />
                    {errors.companyName && <small className="p-error">{errors.companyName.message}</small>}
                </div>

                {/* Car Number */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="carNumber" className="font-medium mb-2 block">
                        {t('edit.carNumber')}
                    </label>
                    <InputText id="carNumber" {...register('carNumber')} className={`w-full ${errors.carNumber ? 'p-invalid' : ''}`} />
                    {errors.carNumber && <small className="p-error">{errors.carNumber.message}</small>}
                </div>

                {/* Password */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="password" className="font-medium mb-2 block">
                        {t('edit.password')}
                    </label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => <Password id="password" value={field.value} onChange={(e) => field.onChange(e.target.value)} toggleMask feedback={false} className={`w-full ${errors.password ? 'p-invalid' : ''}`} />}
                    />
                    {errors.password && <small className="p-error">{errors.password.message}</small>}
                </div>

                {/* File Upload */}
                <div className="field col-12">
                    <label className="font-medium mb-2 block">{t('edit.files')}</label>
                    <FileUploadComponent files={files} onFilesSelected={handleFilesSelected} onRemoveFile={handleRemoveFile} />
                </div>

                {/* Active Checkbox */}
                <div className="field col-12">
                    <div className="flex align-items-center gap-2">
                        <Controller name="isActive" control={control} render={({ field }) => <Checkbox inputId="isActive" checked={field.value} onChange={(e) => field.onChange(e.checked)} />} />
                        <label htmlFor="isActive" className="ml-2">
                            {t('edit.isActive')}
                        </label>
                    </div>
                </div>

                {/* Approval Checkbox */}
                <div className="field col-12">
                    <div className="flex align-items-center gap-2">
                        <Controller name="isApproved" control={control} render={({ field }) => <Checkbox inputId="isApproved" checked={field.value} onChange={(e) => field.onChange(e.checked)} />} />
                        <label htmlFor="isApproved" className="ml-2">
                            {t('edit.isApproved')}
                        </label>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="field col-12 flex justify-content-end gap-3 mt-4">
                    <Button type="button" label={t('edit.cancel')} severity="secondary" onClick={() => router.back()} disabled={isSubmitting} />
                    <Button type="submit" label={isSubmitting ? t('edit.submitting') : t('edit.submit')} severity="success" loading={isSubmitting} disabled={isSubmitting} />
                </div>
            </form>
        </div>
    );
}
