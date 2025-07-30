import { z } from 'zod';

export const DriverSchema = z.object({
    driverName: z.string().min(1, 'اسم السائق مطلوب'),
    phoneNumber: z
        .string()
        .min(1, 'رقم الهاتف مطلوب')
        .regex(/^[0-9]+$/, 'يجب أن يحتوي رقم الهاتف على أرقام فقط'),
    licenseNumber: z.string().min(1, 'رقم الرخصة مطلوب'),
    companyName: z.string().min(1, 'اسم الشركة مطلوب'),
    carNumber: z.string().min(1, 'رقم السيارة مطلوب'),
    password: z.string().min(6, 'يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل'),
    isApproved: z.boolean().default(false)
});

export type DriverFormValues = z.infer<typeof DriverSchema>;
