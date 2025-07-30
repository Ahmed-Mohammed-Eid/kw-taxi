import { z } from 'zod';
import { DriverSchema } from './driver.schema';

export const EditDriverSchema = DriverSchema.extend({
    password: z.string().optional(),
    driverId: z.string().min(1, 'Driver ID is required'),
    isActive: z.boolean().default(false)
});

export type EditDriverFormValues = z.infer<typeof EditDriverSchema>;
