import z from 'zod';

const createOrderSchema = (t: any) => {
    return z.object({
        customerName: z
            .string()
            .min(2, { message: t('validation.min', { min: 2 }) })
            .max(100, { message: t('validation.max', { max: 100 }) })
            .nonempty(t('validation.required')),
        clientPhone: z
            .string()
            .min(8, { message: t('validation.min', { min: 8 }) })
            .max(15, { message: t('validation.max', { max: 15 }) })
            .nonempty(t('validation.required')),
        orderDate: z.date({ message: t('validation.required') }).min(new Date(new Date().setHours(0, 0, 0, 0)), { message: t('validation.futureDate') }),
        orderTime: z.date()
            .refine(
                (val) => {
                    const now = new Date();
                    const minTime = new Date(now.getTime() + 15 * 60 * 1000);
                    return val.getTime() >= minTime.getTime();
                },
                { message: t('validation.futureTime') }
            ),
        serviceType: z.enum(['transportation', 'shipping'], { message: t('validation.enum') }),
        paymentType: z.enum(['subscription', 'cash'], { message: t('validation.enum') }),
        paymentMethod: z.enum(['knet', 'link'], { message: t('validation.enum') })
    });
};

export type CreateOrderSchemaType = z.infer<ReturnType<typeof createOrderSchema>>;

export default createOrderSchema;
