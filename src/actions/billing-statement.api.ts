'use server';
import { api } from "@/trpc/server";
import { ActionResponse } from "@/types/actionResponses";
import { billing_statement } from "@/types/billing-statement";
import { z } from "zod";

const billing_statement_Schema = z.object({
    id: z.string().optional(),
    client_id: z.string().nonempty({ message: "El Cliente es requerido" }),
    creditor_id: z.string().nonempty({ message: "El Acreedor es requerido" }),
    amount: z.number().optional(),
    extraInfo: z.string().optional(),
    showItemAmount: z.boolean().optional(),
    payDate: z.string(),
    status: z.enum(["payed", "pending"], { message: "Invalid status" }),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export async function getBillingStatements(): Promise<ActionResponse<billing_statement[]>> {
    try {
        const result = await api.billing_statement.queries.getAll();
        return {
            data: result,
            success: true,
            message: "Cuentas de cobro obtenidas correctamente"
        }
    } catch (error) {
        return {
            success: false,
            message: "Error al obtener cuentas de cobro"
        }
    }
}

export async function getBillingStatement(id: string): Promise<ActionResponse<billing_statement>> {
    try {
        const result = await api.billing_statement.queries.getOne({ id });
        return {
            data: result,
            success: true,
            message: "Cuenta de cobro obtenida correctamente"
        }
    } catch (error) {
        return {
            success: false,
            message: "Error al obtener cuenta de cobro"
        }
    }
}

export async function createBillingStatement(prevState: ActionResponse<billing_statement>, formData: FormData, date: string): Promise<ActionResponse<billing_statement>> {
    try {
        if (formData.get('client') === "None" || formData.get('creditor') === "None") {
            return {
                success: false,
                message: 'Por favor seleccione un cliente y un acreedor',
            }
        }
        const rawData: billing_statement = {
            extraInfo: "",
            client_id: formData.get('client') as string,
            creditor_id: formData.get('creditor') as string,
            payDate: date,
            status: 'pending',
        }
        const validatedData = billing_statement_Schema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: validatedData.error.flatten().fieldErrors,
                input: rawData,
            }
        }


        await api.billing_statement.mutations.create({
            client_id: validatedData.data.client_id,
            creditor_id: validatedData.data.creditor_id,
            payDate: validatedData.data.payDate,
        });


        return {
            success: true,
            message: 'Cuenta de cobro creada exitosamente!',
        }
    } catch (error) {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }

}

export async function updateBillingStatement(prevState: ActionResponse<billing_statement> | null, formData: FormData, id: string, date: string, amount: number): Promise<ActionResponse<billing_statement>> {

    try {
        const validatedId = z.string().safeParse(id);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'La cuenta de cobro a actualizar no existe',
            };
        }
        console.log("amount", amount)
        const rawData: billing_statement = {
            client_id: "some client",
            creditor_id: "some creditor",
            status: formData.get('status') as string,
            amount: amount,
            extraInfo: formData.get('extraInfo') as string,
            payDate: date,
            showItemAmount: Boolean(formData.get('showItemAmount')),
        }
        const validatedData = billing_statement_Schema.safeParse(rawData);
        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: validatedData.error.flatten().fieldErrors,
                input: rawData,
            }
        }

        await api.billing_statement.mutations.update({
            id: validatedId.data,
            status: validatedData.data.status,
            amount: validatedData.data.amount as number,
            extraInfo: validatedData.data.extraInfo as string,
            payDate: validatedData.data.payDate,
            showItemAmount: validatedData.data.showItemAmount as boolean,
        });

        return {
            success: true,
            message: 'Cuenta de cobro actualizada exitosamente!',
            input: rawData,
        }
    } catch (error) {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function deleteBillingstatement(id: string): Promise<ActionResponse<billing_statement>> {
    try {
        const validatedId = z.string().safeParse(id);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'La cuenta de cobro a eliminar no existe',
            };
        }

        await api.billing_statement.mutations.delete({ id: validatedId.data });

        return {
            success: true,
            message: 'Cuenta de cobro eliminada exitosamente!',
        }
    } catch (error) {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function updateBillingStatementAmount(id: string, amount: number): Promise<ActionResponse<billing_statement>> {
    try {
        const validatedId = z.string().safeParse(id);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'La cuenta de cobro a actualizar no existe',
            };
        }

        await api.billing_statement.mutations.updateAmount({ id: validatedId.data, amount });

        return {
            success: true,
            message: 'Cuenta de cobro actualizada exitosamente!',
        }
    } catch (error) {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}