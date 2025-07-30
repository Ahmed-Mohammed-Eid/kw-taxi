import { z } from 'zod';

export const DriverSchema = z.object({
    driverName: z.string().min(1, 'Driver name is required'),
    phoneNumber: z
        .string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
    licenseNumber: z.string().min(1, 'License number is required'),
    companyName: z.string().min(1, 'Company name is required'),
    carNumber: z.string().min(1, 'Car number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    isApproved: z.boolean().default(false)
});

export type DriverFormValues = z.infer<typeof DriverSchema>;
