import z from "zod";

export const sendOrderSchema = (t:any) => {
    return z.object({
        driverPhone: z.string().min(8, {message: t("sendDialog.errors.driverPhone_error")})
    })
}
