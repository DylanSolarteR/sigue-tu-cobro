'use server';
import { api } from "@/trpc/server";
import { ActionResponse } from "@/types/actionResponses";
import { z } from "zod";
import { billing_statement_item } from "@/types/billing-statement";

const billing_statement_item_Schema = z.object({
    billing_statement_id: z.string(),
    desc: z.string().min(1, { message: "La descripción es requerida" }),
    amount: z.number(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export async function getBillingStatementItems(parentBillingStatementId: string): Promise<ActionResponse<billing_statement_item[]>> {
    try {
        const result = await api.billing_statement_item.queries.getBillingStatementItems({ parentBillingStatementId });
        return {
            data: result,
            success: true,
            message: "Items de cuenta de cobro obtenidos correctamente"
        }
    } catch (error) {
        return {
            success: false,
            message: "Error al obtener items de cuenta de cobro"
        }
    }
}

export async function createBillingStatementItem(prevState: ActionResponse<billing_statement_item>, formData: FormData, idBillingStatement: string):
    Promise<ActionResponse<billing_statement_item>> {
    try {
        const validatedId = z.string().safeParse(idBillingStatement);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'La cuenta de cobro a agregarle el item no es válida',
            };
        }
        const rawData: billing_statement_item = {
            billing_statement_id: validatedId.data,
            desc: formData.get('desc') as string,
            amount: Number(formData.get('amount')),
            isActive: true,
        }

        const validatedData = billing_statement_item_Schema.safeParse(rawData);
        if (!validatedData.success) {
            return {
                success: false,
                message: "Revise los campos del item de cuenta de cobro",
                input: rawData,
            }
        }
        const newItemId = await api.billing_statement_item.mutations.create(validatedData.data);
        const newItem: billing_statement_item = {
            id: newItemId,
            billing_statement_id: validatedData.data.billing_statement_id,
            desc: validatedData.data.desc,
            amount: validatedData.data.amount,
            isActive: validatedData.data.isActive,
        }
        return {
            success: true,
            message: "Item de cuenta de cobro creado correctamente",
            data: newItem
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error al crear item de cuenta de cobro"
        }
    }
}

export async function updateBillingStatementItem(id: string, desc: string, amount: number):
    Promise<ActionResponse<billing_statement_item>> {
    try {
        const rawData: billing_statement_item = {
            billing_statement_id: "",
            desc: desc,
            amount: amount,
        }
        const validatedData = billing_statement_item_Schema.safeParse(rawData);
        if (!validatedData.success) {
            return {
                success: false,
                message: "Revise los campos del item de cuenta de cobro",
                input: rawData,
            }
        }
        await api.billing_statement_item.mutations.update({
            id,
            desc: validatedData.data.desc,
            amount: validatedData.data.amount,
        });
        return {
            success: true,
            message: "Item de cuenta de cobro actualizado correctamente",
            data: validatedData.data
        }
    } catch (error) {
        return {
            success: false,
            message: "Error al actualizar item de cuenta de cobro"
        }
    }
}


export async function deleteBillingStatementItem(id: string): Promise<ActionResponse<billing_statement_item>> {
    try {
        await api.billing_statement_item.mutations.delete({ id });
        return {
            success: true,
            message: "Item eliminado correctamente"
        }
    } catch (error) {
        return {
            success: false,
            message: "Error al eliminar item de cuenta de cobro"
        }
    }
}